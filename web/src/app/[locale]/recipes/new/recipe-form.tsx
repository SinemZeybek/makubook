"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";
import { MEAL_TYPES } from "@/lib/mealTypes";
import RecipeContentFields, {
  type RecipeContentHandle,
  type RecipeContentValues,
} from "./recipe-content-fields";
import PhotoCropper from "../../photo-cropper";

export default function RecipeForm({ userId }: { userId: string }) {
  const t = useTranslations("RecipeForm");
  const tMeal = useTranslations("MealTypes");
  const tCountry = useTranslations("Countries");
  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => tCountry(a).localeCompare(tCountry(b))),
    [tCountry]
  );
  const [country, setCountry] = useState("");
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [servings, setServings] = useState("");
  const [language, setLanguage] = useState<"fi" | "en">("en");
  const [showSecondLanguage, setShowSecondLanguage] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
  const [submittedRecipeId, setSubmittedRecipeId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const primaryRef = useRef<RecipeContentHandle>(null);
  const secondaryRef = useRef<RecipeContentHandle>(null);
  const [primaryKey, setPrimaryKey] = useState(0);
  const [carriedValues, setCarriedValues] = useState<
    RecipeContentValues | undefined
  >(undefined);

  const secondaryLanguage: "fi" | "en" = language === "en" ? "fi" : "en";

  function languageLabel(lang: "fi" | "en") {
    return lang === "en" ? t("english") : t("finnish");
  }

  function removePrimaryColumn() {
    setCarriedValues(secondaryRef.current?.getValues());
    setLanguage(secondaryLanguage);
    setPrimaryKey((k) => k + 1);
    setShowSecondLanguage(false);
  }

  function removeSecondaryColumn() {
    setShowSecondLanguage(false);
  }

  function toggleMealType(type: string) {
    setMealTypes((prev) =>
      prev.includes(type) ? prev.filter((m) => m !== type) : [...prev, type]
    );
  }

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
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
    if (originalPhoto) setCropSource(originalPhoto);
  }

  function handleCropCancel() {
    if (!photo && cropSource) {
      URL.revokeObjectURL(cropSource.src);
      setOriginalPhoto(null);
    }
    setCropSource(null);
  }

  function handleCropSave(croppedFile: File) {
    setPhoto(croppedFile);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(croppedFile);
    });
    setCropSource(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!photo) {
      setError(t("photoRequiredError"));
      return;
    }

    if (mealTypes.length === 0) {
      setError(t("mealTypeRequiredError"));
      return;
    }

    const primaryValues = primaryRef.current?.getValues();
    if (!primaryValues) return;
    const secondaryValues = showSecondLanguage
      ? secondaryRef.current?.getValues() ?? null
      : null;

    setLoading(true);

    const supabase = createClient();

    async function insertRecipeRow(
      values: RecipeContentValues,
      lang: "fi" | "en"
    ) {
      const instructions = values.steps.map((step) => step.trim()).filter(Boolean);
      const ingredientList = values.ingredients
        .map((ingredient) => ({
          quantity: ingredient.quantity.trim().replace(",", "."),
          unit: ingredient.unit,
          name: ingredient.name.trim(),
        }))
        .filter((ingredient) => ingredient.name);

      return supabase
        .from("recipes")
        .insert({
          author_id: userId,
          title: values.title,
          description: values.description,
          country,
          meal_type: mealTypes,
          servings: Number(servings),
          ingredients: ingredientList,
          instructions,
          tips: values.tips.trim() || null,
          language: lang,
        })
        .select()
        .single();
    }

    const { data: recipe, error: insertError } = await insertRecipeRow(
      primaryValues,
      language
    );

    if (insertError || !recipe) {
      setError(insertError?.message ?? "Could not create recipe");
      setLoading(false);
      return;
    }

    let secondaryRecipe: { id: string } | null = null;
    if (secondaryValues) {
      const { data: secondRecipe, error: secondError } = await insertRecipeRow(
        secondaryValues,
        secondaryLanguage
      );
      if (secondError) {
        setError(secondError.message);
        setLoading(false);
        return;
      }
      secondaryRecipe = secondRecipe;
    }

    if (secondaryRecipe) {
      await supabase
        .from("recipes")
        .update({ translation_of: secondaryRecipe.id })
        .eq("id", recipe.id);
      await supabase
        .from("recipes")
        .update({ translation_of: recipe.id })
        .eq("id", secondaryRecipe.id);
    }

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

    if (secondaryRecipe) {
      await supabase
        .from("recipe_images")
        .insert({ recipe_id: secondaryRecipe.id, url: publicUrl });
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
          {t("submittedHeading")}
        </h2>
        <p className="max-w-sm text-sm text-berry/70">{t("submittedBody")}</p>
        <Link
          href={`/recipes/${submittedRecipeId}`}
          className="mt-2 text-sm text-berry underline"
        >
          {t("viewRecipeNow")}
        </Link>
      </div>
    );
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
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
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
                <span className="text-xs text-berry/40">{t("required")}</span>
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
              {photoPreview ? t("retakePhoto") : t("takePhoto")}
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
              {photoPreview ? t("chooseDifferentPhoto") : t("chooseFromLibrary")}
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
          <span className="font-semibold text-berry">{t("servings")}</span>
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
      </div>

      <div
        className={
          showSecondLanguage
            ? "grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start"
            : "mx-auto w-full max-w-xl"
        }
      >
        <div className="flex flex-col gap-4">
          {showSecondLanguage && (
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold uppercase tracking-wide text-berry">
                {languageLabel(language)}
              </h2>
              <button
                type="button"
                onClick={removePrimaryColumn}
                className="text-xs text-berry/60 underline"
              >
                {t("remove")}
              </button>
            </div>
          )}
          <RecipeContentFields
            key={primaryKey}
            ref={primaryRef}
            lang={language}
            initialValues={carriedValues}
          />
        </div>

        {showSecondLanguage && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold uppercase tracking-wide text-berry">
                {languageLabel(secondaryLanguage)}
              </h2>
              <button
                type="button"
                onClick={removeSecondaryColumn}
                className="text-xs text-berry/60 underline"
              >
                {t("remove")}
              </button>
            </div>
            <RecipeContentFields ref={secondaryRef} lang={secondaryLanguage} />
          </div>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        {!showSecondLanguage && (
          <>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "fi" | "en")}
              className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
            >
              <option value="en">{t("english")}</option>
              <option value="fi">{t("finnish")}</option>
            </select>

            <div className="rounded-md border border-berry/10 bg-berry/5 px-4 py-3">
              <p className="text-sm text-berry/70">
                {t("addOtherLanguagePrompt")}
              </p>
              <button
                type="button"
                onClick={() => setShowSecondLanguage(true)}
                className="mt-1 text-sm font-medium text-berry underline"
              >
                {t("addAnotherLanguage")}
              </button>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-start gap-2 rounded-md border border-berry/10 bg-berry/5 px-4 py-3">
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
          <p className="text-sm text-berry/60">{t("editorNote")}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
        >
          {loading ? t("submitting") : t("submitForReview")}
        </button>
      </div>
      </form>
    </>
  );
}
