"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";
import { UNITS } from "@/lib/units";
import { MEAL_TYPES } from "@/lib/mealTypes";

type Ingredient = { quantity: string; unit: string; name: string };

export default function RecipeForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [mealType, setMealType] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { quantity: "", unit: "", name: "" },
  ]);
  const [steps, setSteps] = useState([""]);
  const [tips, setTips] = useState("");
  const [language, setLanguage] = useState<"fi" | "en">("en");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function updateIngredient(
    index: number,
    field: keyof Ingredient,
    value: string
  ) {
    setIngredients((prev) =>
      prev.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { quantity: "", unit: "", name: "" }]);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStep(index: number, value: string) {
    setSteps((prev) => prev.map((step, i) => (i === index ? value : step)));
  }

  function addStep() {
    setSteps((prev) => [...prev, ""]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const instructions = steps.map((step) => step.trim()).filter(Boolean);
    const ingredientList = ingredients
      .map((ingredient) => ({
        quantity: ingredient.quantity.trim().replace(",", "."),
        unit: ingredient.unit,
        name: ingredient.name.trim(),
      }))
      .filter((ingredient) => ingredient.name);

    const { data: recipe, error: insertError } = await supabase
      .from("recipes")
      .insert({
        author_id: userId,
        title,
        description,
        country,
        meal_type: mealType,
        ingredients: ingredientList,
        instructions,
        tips: tips.trim() || null,
        language,
      })
      .select()
      .single();

    if (insertError || !recipe) {
      setError(insertError?.message ?? "Could not create recipe");
      setLoading(false);
      return;
    }

    if (photo) {
      const path = `${userId}/${recipe.id}/${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(path, photo);

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("recipe-images").getPublicUrl(path);

      await supabase
        .from("recipe_images")
        .insert({ recipe_id: recipe.id, url: publicUrl });
    }

    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
      />

      <textarea
        placeholder="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={2}
        className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
      />

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
        className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
      >
        <option value="" disabled>
          Country of origin
        </option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        required
        className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
      >
        <option value="" disabled>
          Meal type
        </option>
        {MEAL_TYPES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-berry/70">
          Ingredients
        </label>
        {ingredients.map((ingredient, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Qty"
              pattern="^\d+([.,]\d+)?$"
              title="A number like 1 or 1,5"
              value={ingredient.quantity}
              onChange={(e) =>
                updateIngredient(i, "quantity", e.target.value)
              }
              required
              className="w-16 rounded-md border border-berry/20 px-2 py-2 text-berry placeholder:text-berry/40"
            />
            <select
              value={ingredient.unit}
              onChange={(e) => updateIngredient(i, "unit", e.target.value)}
              required
              className="w-24 rounded-md border border-berry/20 px-2 py-2 text-berry"
            >
              <option value="" disabled>
                Unit
              </option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Ingredient"
              value={ingredient.name}
              onChange={(e) => updateIngredient(i, "name", e.target.value)}
              required
              className="min-w-0 flex-1 rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="text-sm text-berry/60"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="self-start text-sm text-berry underline"
        >
          Add another ingredient
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-berry/70">
          Steps
        </label>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Step ${i + 1}`}
              value={step}
              onChange={(e) => updateStep(i, e.target.value)}
              required
              className="min-w-0 flex-1 rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
            />
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="text-sm text-berry/60"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addStep}
          className="self-start text-sm text-berry underline"
        >
          Add another step
        </button>
      </div>

      <textarea
        placeholder="Tips or extra information (optional)"
        value={tips}
        onChange={(e) => setTips(e.target.value)}
        rows={2}
        className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
      />

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "fi" | "en")}
        className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
      >
        <option value="en">English</option>
        <option value="fi">Finnish</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        required
        className="text-sm text-berry/70"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add recipe"}
      </button>
    </form>
  );
}
