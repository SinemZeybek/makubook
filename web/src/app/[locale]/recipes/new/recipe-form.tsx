"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
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
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { quantity: "", unit: "", name: "" },
  ]);
  const [steps, setSteps] = useState([""]);
  const [tips, setTips] = useState("");
  const [language, setLanguage] = useState<"fi" | "en">("en");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedRecipeId, setSubmittedRecipeId] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

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

    if (!photo) {
      setError("Please add a photo of your dish.");
      return;
    }

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
        servings: Number(servings),
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
    setSubmittedRecipeId(recipe.id);
    setTimeout(() => {
      router.push(`/recipes/${recipe.id}`);
      router.refresh();
    }, 3500);
  }

  if (submittedRecipeId) {
    return (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-berry/10 bg-white px-6 py-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/25 text-berry">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-berry">
          Recipe submitted!
        </h2>
        <p className="max-w-sm text-sm text-berry/70">
          Our review usually doesn&apos;t take long. We&apos;ll email you as
          soon as it&apos;s published.
        </p>
        <Link
          href={`/recipes/${submittedRecipeId}`}
          className="mt-2 text-sm text-berry underline"
        >
          View your recipe now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <input
          id="recipe-photo-camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="sr-only"
        />
        <input
          id="recipe-photo-library-input"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="sr-only"
        />

        <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-berry/25 bg-berry/5">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-berry/45">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8a2 2 0 0 1 2-2h1.5l1-1.5h9l1 1.5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-sm font-medium">Add a photo</span>
              <span className="text-xs text-berry/40">Required</span>
            </div>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <label
            htmlFor="recipe-photo-camera-input"
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-berry/20 px-3 py-2 text-sm font-medium text-berry transition-colors hover:bg-berry/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8a2 2 0 0 1 2-2h1.5l1-1.5h9l1 1.5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {photoPreview ? "Retake photo" : "Take a photo"}
          </label>
          <label
            htmlFor="recipe-photo-library-input"
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-berry/20 px-3 py-2 text-sm font-medium text-berry transition-colors hover:bg-berry/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            {photoPreview ? "Choose different photo" : "Choose from library"}
          </label>
        </div>
      </div>

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

      <label className="flex flex-col gap-1 text-sm text-berry/70">
        <span className="font-semibold text-berry">Servings</span>
        <input
          type="number"
          placeholder="e.g. 4"
          min={1}
          step={1}
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          required
          className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
        />
      </label>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-berry">
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
        <label className="text-sm font-semibold text-berry">
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-start gap-2 rounded-md border border-berry/10 bg-berry/5 px-4 py-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0 text-berry/50"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="text-sm text-berry/60">
          New recipes are reviewed by an editor before they're published
          and visible to everyone.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}
