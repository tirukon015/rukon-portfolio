/**
 * Renders a JSON-LD block.
 *
 * Server-rendered, so the markup is in the HTML a crawler receives rather than
 * appearing after hydration. `<` is escaped because a string in the data that
 * contained `</script>` would otherwise close the tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
