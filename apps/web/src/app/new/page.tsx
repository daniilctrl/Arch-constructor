"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Input } from "@arch/core";
import InputForm from "@/components/InputForm";
import LivePreview from "@/components/LivePreview";
import { createDesign } from "@/lib/api";
import { defaultInput } from "@/lib/defaults";

export default function NewDesignPage() {
  const router = useRouter();
  const [liveInput, setLiveInput] = useState<Input>(defaultInput);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Design from requirements</h1>
      <p className="text-gray-700 mb-6 text-sm">
        Tweak the form on the left. The diagram on the right rebuilds itself as
        you go — every choice has a visible effect.
      </p>

      <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:items-start">
        <div>
          <InputForm
            submitLabel="Save this design"
            onChange={({ input }) => setLiveInput(input)}
            onSubmit={async (values) => {
              const design = await createDesign(values);
              router.push(`/designs/${design.id}`);
            }}
          />
        </div>
        <aside className="md:sticky md:top-4">
          <LivePreview input={liveInput} />
        </aside>
      </div>
    </div>
  );
}
