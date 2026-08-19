"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";
import { UNITS } from "@/lib/units";
import { MEAL_TYPES } from "@/lib/mealTypes";
import DeleteRecipeButton from "../delete-recipe-button";
import PhotoCropper from "../../../photo-cropper";

type Ingredient = { quantity: string; unit: string; name: string };

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  country: string | null;
  meal_type: string[] | null;
  servings: number | null;
  language: "fi" | "en";
  ingredients: unknown;
  instructions: unknown;
  tips: string | null;
  recipe_images?: { url: string }[] | null;
};

export default function EditRecipeForm({
  recipe,
  userId,
}: {
  recipe: Recipe;
  userId: string;
}) {
  const t = useTranslations("RecipeForm");
  const tMeal = useTranslations("MealTypes");
  const tCountry = useTranslations("Countries");
  const tUnit = useTranslations("Units");
  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => tCountry(a).localeCompare(tCountry(b))),
    [tCountry]
  );
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description ?? "");
  const [country, setCountry] = useState(recipe.country ?? "");
  const [mealTypes, setMealTypes] = useState<string[]>(recipe.meal_type ?? []);
  const [servings, setServings] = useState(
    recipe.servings ? String(recipe.servings) : ""
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
      ? (recipe.ingredients as Ingredient[])
      : [{ quantity: "", unit: "", name: "" }]
  );
  const [steps, setSteps] = useState<string[]>(
    Array.isArray(recipe.instructions) && recipe.instructions.length > 0
      ? (recipe.instructions as string[])
      : [""]
  );
  const [tips, setTips] = useState(recipe.tips ?? "");
  const [language, setLanguage] = useState<"fi" | "en">(recipe.language);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    recipe.recipe_images?.[0]?.url ?? null
  );
  const [originalPhoto, setOriginalPhoto] = useState<{
    src: string;
    fileName: string;
  } | null>(null);
  const [cropSource, setCropSource] = useState<{
    src: string;
    fileName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (photo && photoPreview) URL.revokeObjectURL(photoPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoPreview]);

  useEffect(() => {
    return () => {
      if (originalPhoto) URL.revokeObjectURL(originalPhoto.src);
    };
  }, [originalPhoto]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;

    const src = URL.createObjectURL(file);
    setOriginalPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.src);
      return { src, fileName: file.name };
    });
    setCropSource({ src, fileName: file.name });
  }

  function handleEditCrop() {
    if (originalPhoto) {
      setCropSource(originalPhoto);
    } else if (photoPreview) {
      setCropSource({ src: photoPreview, fileName: "photo.jpg" });
    }
  }

  function handleCropCancel() {
    if (!photo && cropSource && cropSource === originalPhoto) {
      URL.revokeObjectURL(cropSource.src);
      setOriginalPhoto(null);
    }
    setCropSource(null);
  }

  function handleCropSave(croppedFile: File) {
    setPhoto(croppedFile);
    setPhotoPreview((prev) => {
      if (prev && photo) URL.revokeObjectURL(prev);
      return URL.createObjectURL(croppedFile);
    });
    setCropSource(null);
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

  function toggleMealType(type: string) {
    setMealTypes((prev) =>
      prev.includes(type) ? prev.filter((m) => m !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mealTypes.length === 0) {
      setError(t("mealTypeRequiredError"));
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

    const { error: updateError } = await supabase
      .from("recipes")
      .update({
        title,
        description,
        country,
        meal_type: mealTypes,
        servings: Number(servings),
        ingredients: ingredientList,
        instructions,
        tips: tips.trim() || null,
        language,
      })
      .eq("id", recipe.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    if (photo) {
      const path = `${userId}/${recipe.id}/${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(path, photo, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("recipe-images").getPublicUrl(path);

      await supabase.from("recipe_images").delete().eq("recipe_id", recipe.id);
      await supabase
        .from("recipe_images")
        .insert({ recipe_id: recipe.id, url: publicUrl });
    }

    setLoading(false);
    router.push(`/recipes/${recipe.id}`);
    router.refresh();
  }

  return (
    <>
      {cropSource && (
        <PhotoCropper
          imageSrc={cropSource.src}
          fileName={cropSource.fileName}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
        />
      )}

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

        <label
          htmlFor="recipe-photo-library-input"
          className="flex h-72 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-berry/25 bg-berry/5 transition-colors hover:border-berry/40 hover:bg-berry/10"
        >
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
              <span className="text-sm font-medium">{t("addPhoto")}</span>
            </div>
          )}
        </label>

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
            {t("retakePhoto")}
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
            {t("chooseDifferentPhoto")}
          </label>
        </div>

        {photoPreview && (
          <button
            type="button"
            onClick={handleEditCrop}
            className="mt-2 w-full text-center text-sm text-berry underline"
          >
            {t("editCrop")}
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder={t("titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
      />

      <textarea
        placeholder={t("descriptionPlaceholder")}
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
          {t("countryPlaceholder")}
        </option>
        {sortedCountries.map((c) => (
          <option key={c} value={c}>
            {tCountry(c)}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-berry">
          {t("mealTypePlaceholder")}
        </span>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((m) => (
            <label
              key={m}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                mealTypes.includes(m)
                  ? "border-berry bg-berry text-cream"
                  : "border-berry/20 text-berry"
              }`}
            >
              <input
                type="checkbox"
                checked={mealTypes.includes(m)}
                onChange={() => toggleMealType(m)}
                className="sr-only"
              />
              {tMeal(m)}
            </label>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm text-berry/70">
        {t("servings")}
        <input
          type="number"
          placeholder={t("servingsPlaceholder")}
          min={1}
          step={1}
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          required
          className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
        />
      </label>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-berry/70">
          {t("ingredients")}
        </label>
        {ingredients.map((ingredient, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder={t("qtyPlaceholder")}
              pattern="^\d+([.,]\d+)?$"
              title={t("qtyTitle")}
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
                {t("unitPlaceholder")}
              </option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {tUnit(unit)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t("ingredientPlaceholder")}
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
                {t("remove")}
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="self-start text-sm text-berry underline"
        >
          {t("addIngredient")}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-berry/70">
          {t("steps")}
        </label>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t("stepPlaceholder", { number: i + 1 })}
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
                {t("remove")}
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addStep}
          className="self-start text-sm text-berry underline"
        >
          {t("addStep")}
        </button>
      </div>

      <textarea
        placeholder={t("tipsPlaceholder")}
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
        <option value="fi">{t("finnish")}</option>
        <option value="en">{t("english")}</option>
      </select>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
      >
        {loading ? t("saving") : t("saveChanges")}
      </button>

      <div className="mt-4 border-t border-berry/15 pt-4">
        <DeleteRecipeButton recipeId={recipe.id} />
      </div>
      </form>
    </>
  );
}
