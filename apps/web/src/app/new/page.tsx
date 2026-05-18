"use client";

import { useRouter } from "next/navigation";
import InputForm from "@/components/InputForm";
import { createDesign } from "@/lib/api";

export default function NewDesignPage() {
  const router = useRouter();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New design</h1>
      <p className="text-gray-700 mb-4 text-sm">
        Tell us about your project. We&apos;ll synthesize an architecture from the rules.
      </p>
      <InputForm
        onSubmit={async (values) => {
          const design = await createDesign(values);
          router.push(`/designs/${design.id}`);
        }}
      />
    </div>
  );
}
