"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslations } from "next-intl";
import { UNITS } from "@/lib/units";

type Ingredient = { quantity: string; unit: string; name: string };

export type RecipeContentValues = {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  tips: string;
};

export type RecipeContentHandle = {
  getValues: () => RecipeContentValues;
};

const RecipeContentFields = forwardRef<RecipeContentHandle>(
  function RecipeContentFields(_props, ref) {
    const t = useTranslations("RecipeForm");
    const tUnit = useTranslations("Units");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState<Ingredient[]>([
      { quantity: "", unit: "", name: "" },
    ]);
    const [steps, setSteps] = useState([""]);
    const [tips, setTips] = useState("");

    useImperativeHandle(ref, () => ({
      getValues: () => ({ title, description, ingredients, steps, tips }),
    }));

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

    return (
      <div className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-berry">
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
          <label className="text-sm font-semibold text-berry">
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
      </div>
    );
  }
);

export default RecipeContentFields;
