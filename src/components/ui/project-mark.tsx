import Image from "next/image";
import type { Project } from "@/content/projects";

type Props = {
  project: Project;
  width: number;
  height: number;
  /** Applied to every rendered <Image>, so all variants stay the same size. */
  className: string;
  /** Fallback wordmark styling when a project has no image. */
  fallbackClassName: string;
};

/**
 * A project's wordmark, swapped per theme where a second file exists.
 *
 * Some marks are supplied with an opaque background rather than a transparent
 * one, which makes a single file wrong in one of the two themes: the RPOMS
 * mark is dark-on-white, so on the dark theme it rendered as a white block.
 *
 * The swap is plain CSS driven by the `data-theme` attribute rather than a
 * `useTheme()` read, for two reasons: this keeps the card a server component,
 * and the correct mark is painted on the first frame instead of after the
 * theme provider mounts. Both files sit in the markup with the same alt text;
 * `display: none` takes the inactive one out of the accessibility tree, so
 * exactly one wordmark is announced in either theme.
 */
export function ProjectMark({
  project,
  width,
  height,
  className,
  fallbackClassName,
}: Props) {
  if (!project.image) {
    return <span className={fallbackClassName}>{project.name}</span>;
  }

  const { src, srcDark, alt } = project.image;

  if (!srcDark) {
    return (
      <Image src={src} alt={alt} width={width} height={height} className={className} />
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`theme-light-only ${className}`}
      />
      <Image
        src={srcDark}
        alt={alt}
        width={width}
        height={height}
        className={`theme-dark-only ${className}`}
      />
    </>
  );
}
