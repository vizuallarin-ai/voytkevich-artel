import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  href?: string;
  variant?: "default" | "outline";
};

export function ProjectInlineCta({
  label,
  href = "#project-lead",
  variant = "outline",
}: Props) {
  return (
    <div className="my-10 flex justify-center">
      <Button asChild variant={variant} size="lg">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
