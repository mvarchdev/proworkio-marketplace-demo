import { Badge } from "@proworkio/ui";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <Badge>{eyebrow}</Badge>
      <h2 className="text-balance text-4xl font-black tracking-tight text-[#1E1F48] sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-lg leading-8 text-[#1E1F48]/70">{description}</p>
      ) : null}
    </div>
  );
}
