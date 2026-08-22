"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

const DEFAULT_AVATAR = "/default-avatar.png";

type AvatarImageProps = Omit<ImageProps, "src" | "onError" | "alt"> & {
  src?: string | null;
  alt?: string;
};

/**
 * Wraps next/image with a fallback to the default avatar — both when
 * there's no avatar_url at all, and when one is set but fails to load
 * (e.g. a Google account with no profile picture set).
 */
export default function AvatarImage({ src, alt = "", ...props }: AvatarImageProps) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_AVATAR);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(DEFAULT_AVATAR)}
    />
  );
}
