"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { InputSchema } from "@arch/core";
import { createDesign } from "@/lib/api";
import { defaultInput } from "@/lib/defaults";

// Form-level schema adds the optional name field around the core input.
const FormSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  input: InputSchema,
});
type FormValues = z.infer<typeof FormSchema>;

const opts = {
  rps: ["low", "medium", "high", "very_high"],
  dataVolume: ["small", "medium", "large"],
  growth: ["stable", "growing", "viral"],
  dataShape: ["relational", "document", "key_value", "graph", "timeseries", "mixed"],
  consistency: ["strong", "eventual", "mixed"],
  readWriteRatio: ["read_heavy", "balanced", "write_heavy"],
  search: ["none", "basic", "fulltext"],
  teamSize: ["solo", "small", "medium", "large"],
  teamExperience: ["junior", "mixed", "senior"],
  deployment: ["on_prem", "cloud", "hybrid"],
  budget: ["tight", "normal", "generous"],
} as const;

const complianceOptions = ["none", "gdpr", "hipaa", "pci"] as const;

export default function InputForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", input: defaultInput },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...(values.name ? { name: values.name } : {}),
        input: values.input,
      };
      const design = await createDesign(payload);
      router.push(`/designs/${design.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create design");
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <section className="section">
        <h2>About this design</h2>
        <label className="label" htmlFor="name">
          Name (optional)
        </label>
        <input
          id="name"
          className="input"
          placeholder="e.g. Photo sharing service"
          {...register("name")}
        />
      </section>

      <section className="section">
        <h2>Workload</h2>
        <div className="grid grid-cols-2 gap-3">
          <Select label="RPS" name="input.rps" options={opts.rps} register={register} />
          <Select label="Data volume" name="input.dataVolume" options={opts.dataVolume} register={register} />
          <Select label="Growth" name="input.growth" options={opts.growth} register={register} />
          <Select label="Read/Write ratio" name="input.readWriteRatio" options={opts.readWriteRatio} register={register} />
        </div>
        <CheckBox label="Latency critical (p99 < 100ms)" name="input.latencyCritical" register={register} />
      </section>

      <section className="section">
        <h2>Data</h2>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Shape" name="input.dataShape" options={opts.dataShape} register={register} />
          <Select label="Consistency" name="input.consistency" options={opts.consistency} register={register} />
        </div>
      </section>

      <section className="section">
        <h2>Features</h2>
        <CheckBox label="Realtime (push, websockets)" name="input.realtime" register={register} />
        <CheckBox label="Long-running jobs (reports, ML, video)" name="input.longRunningJobs" register={register} />
        <CheckBox label="File storage (images, documents)" name="input.fileStorage" register={register} />
        <CheckBox label="Analytics / dashboards" name="input.analytics" register={register} />
        <Select label="Search" name="input.search" options={opts.search} register={register} />
      </section>

      <section className="section">
        <h2>Team & deployment</h2>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Team size" name="input.teamSize" options={opts.teamSize} register={register} />
          <Select label="Experience" name="input.teamExperience" options={opts.teamExperience} register={register} />
          <Select label="Deployment" name="input.deployment" options={opts.deployment} register={register} />
          <Select label="Budget" name="input.budget" options={opts.budget} register={register} />
        </div>
        <div className="mt-3">
          <span className="label">Compliance</span>
          <Controller
            control={control}
            name="input.compliance"
            render={({ field }) => (
              <div className="flex flex-wrap gap-3">
                {complianceOptions.map((c) => {
                  const checked = field.value?.includes(c) ?? false;
                  return (
                    <label key={c} className="inline-flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(field.value ?? []);
                          if (e.target.checked) next.add(c);
                          else next.delete(c);
                          field.onChange(Array.from(next));
                        }}
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>
      </section>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {!formState.isValid && formState.isSubmitted && (
        <div className="text-sm text-red-600">
          Fix invalid fields above and try again.
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn">
        {submitting ? "Building..." : "Build architecture"}
      </button>
    </form>
  );
}

function Select({
  label,
  name,
  options,
  register,
}: {
  label: string;
  name: string;
  options: readonly string[];
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" {...register(name as never)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckBox({
  label,
  name,
  register,
}: {
  label: string;
  name: string;
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm mr-4">
      <input type="checkbox" {...register(name as never)} />
      {label}
    </label>
  );
}

