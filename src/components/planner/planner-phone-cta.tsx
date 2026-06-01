import Link from "next/link";
import { Phone } from "lucide-react";
import { brand } from "@/data/brand";
import { Button } from "@/components/ui/button";

export function PlannerPhoneCta() {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-sm border border-wood/25 bg-wood/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">Нужен расчёт без планировщика?</span>{" "}
        Позвоните — обсудим участок и подберём проект из каталога.
      </p>
      <Button asChild size="sm" className="shrink-0">
        <Link href={`tel:${brand.phone}`}>
          <Phone className="mr-2 h-4 w-4" aria-hidden />
          {brand.phoneDisplay}
        </Link>
      </Button>
    </div>
  );
}
