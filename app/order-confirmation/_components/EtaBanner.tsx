import { Bike } from "lucide-react";
import { etaText, statusLabel, type TrackedOrder } from "@/lib/tracking";

type Props = { order: Pick<TrackedOrder, "status" | "outForDeliveryAt">; now: number };

export default function EtaBanner({ order, now }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
      <Bike className="h-6 w-6 text-brand" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">{statusLabel(order.status)}</p>
        <p className="text-sm text-muted-foreground">{etaText(order, now)}</p>
      </div>
    </div>
  );
}
