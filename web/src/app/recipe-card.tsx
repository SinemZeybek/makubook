import Image from "next/image";
import Link from "next/link";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  country: string | null;
  meal_type: string | null;
  language: string;
  recipe_images: { url: string }[] | null;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="block overflow-hidden rounded-lg border border-berry/15 bg-white hover:border-berry/30"
    >
      <div className="relative h-56 w-full bg-berry/5">
        {recipe.recipe_images?.[0]?.url && (
          <Image
            src={recipe.recipe_images[0].url}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-medium text-berry">{recipe.title}</h2>
            {recipe.country && (
              <span className="rounded bg-gold/30 px-1.5 py-0.5 text-xs text-berry">
                {recipe.country}
              </span>
            )}
            {recipe.meal_type && (
              <span className="rounded bg-berry/10 px-1.5 py-0.5 text-xs text-berry">
                {recipe.meal_type}
              </span>
            )}
            <span className="rounded bg-berry px-1.5 py-0.5 text-xs uppercase text-cream">
              {recipe.language}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative h-5 w-5 overflow-hidden rounded-full">
              <Image
                src={recipe.profiles?.avatar_url || "/default-avatar.png"}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs text-berry/60">
              {recipe.profiles?.display_name ?? "Anonymous"}
            </span>
          </div>
        </div>
        {recipe.description && (
          <p className="mt-2 text-base text-berry/70">{recipe.description}</p>
        )}
      </div>
    </Link>
  );
}
