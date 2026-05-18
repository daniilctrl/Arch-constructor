"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { InputSchema, type Input } from "@arch/core";
import { defaultInput } from "@/lib/defaults";
import { complianceOptions, fields, toggles, type SelectOption, type ToggleDef } from "@/lib/fields";

const FormSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  input: InputSchema,
});
type FormValues = z.infer<typeof FormSchema>;

export type InputFormProps = {
  initial?: Input;
  showName?: boolean;
  submitLabel?: string;
  onSubmit: (values: { name?: string; input: Input }) => Promise<void>;
  onChange?: (values: { name?: string; input: Input }) => void;
};

export default function InputForm({
  initial,
  showName = true,
  submitLabel = "Build architecture",
  onSubmit,
  onChange,
}: InputFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState, watch } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", input: initial ?? defaultInput },
  });

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const emit = (v: { name?: string; input?: Input }) => {
      if (v.input && onChangeRef.current) {
        onChangeRef.current({ name: v.name, input: v.input });
      }
    };
    emit(watch());
    const sub = watch((value) => emit(value as { name?: string; input?: Input }));
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...(values.name ? { name: values.name } : {}),
        input: values.input,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      {showName && (
        <section className="section">
          <h2>Name this design</h2>
          <input
            id="name"
            className="input"
            placeholder="e.g. Photo sharing service"
            {...register("name")}
          />
          <p className="text-xs text-gray-500 mt-1">Optional. Used for the saved page title.</p>
        </section>
      )}

      <section className="section">
        <h2>Workload</h2>
        <div className="space-y-4">
          <Slider
            name="input.rps"
            question={fields.rps.question}
            options={fields.rps.options}
            control={control}
          />
          <Slider
            name="input.dataVolume"
            question={fields.dataVolume.question}
            options={fields.dataVolume.options}
            control={control}
          />
          <Slider
            name="input.growth"
            question={fields.growth.question}
            options={fields.growth.options}
            control={control}
          />
          <Field
            name="input.readWriteRatio"
            question={fields.readWriteRatio.question}
            options={fields.readWriteRatio.options}
            register={register}
          />
          <Toggle def={toggles.latencyCritical} register={register} />
        </div>
      </section>

      <section className="section">
        <h2>Data</h2>
        <div className="space-y-3">
          <Field
            name="input.dataShape"
            question={fields.dataShape.question}
            options={fields.dataShape.options}
            register={register}
          />
          <Field
            name="input.consistency"
            question={fields.consistency.question}
            options={fields.consistency.options}
            register={register}
          />
        </div>
      </section>

      <section className="section">
        <h2>What it does</h2>
        <div className="space-y-2">
          <Toggle def={toggles.realtime} register={register} />
          <Toggle def={toggles.longRunningJobs} register={register} />
          <Toggle def={toggles.fileStorage} register={register} />
          <Toggle def={toggles.analytics} register={register} />
        </div>
        <div className="mt-4">
          <Field
            name="input.search"
            question={fields.search.question}
            options={fields.search.options}
            register={register}
          />
        </div>
      </section>

      <section className="section">
        <h2>Team & deployment</h2>
        <div className="space-y-4">
          <Slider
            name="input.teamSize"
            question={fields.teamSize.question}
            options={fields.teamSize.options}
            control={control}
          />
          <Field
            name="input.teamExperience"
            question={fields.teamExperience.question}
            options={fields.teamExperience.options}
            register={register}
          />
          <Field
            name="input.deployment"
            question={fields.deployment.question}
            options={fields.deployment.options}
            register={register}
          />
          <Slider
            name="input.budget"
            question={fields.budget.question}
            options={fields.budget.options}
            control={control}
          />
          <ComplianceField control={control} />
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
        {submitting ? "Working..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  name,
  question,
  options,
  register,
}: {
  name: string;
  question: string;
  options: readonly SelectOption[];
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  return (
    <div>
      <label className="label">{question}</label>
      <select className="input" {...register(name as never)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Slider({
  name,
  question,
  options,
  control,
}: {
  name: string;
  question: string;
  options: readonly SelectOption[];
  control: ReturnType<typeof useForm<FormValues>>["control"];
}) {
  return (
    <Controller
      control={control}
      name={name as never}
      render={({ field }) => {
        const idx = Math.max(
          0,
          options.findIndex((o) => o.value === field.value),
        );
        const current = options[idx] ?? options[0];
        // Short tick label = part before " — " in the option label.
        const tickLabel = (o: SelectOption) => o.label.split(" — ")[0] ?? o.label;
        return (
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-sm font-medium text-gray-700">
                {question}
              </label>
              <span className="text-xs text-gray-600">{current?.label}</span>
            </div>
            <input
              type="range"
              min={0}
              max={options.length - 1}
              step={1}
              value={idx}
              onChange={(e) => {
                const next = options[Number(e.target.value)];
                if (next) field.onChange(next.value);
              }}
              className="w-full accent-gray-900"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              {options.map((o, i) => (
                <span
                  key={o.value}
                  className={
                    i === idx ? "text-gray-700 font-medium" : ""
                  }
                >
                  {tickLabel(o)}
                </span>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}

function Toggle({
  def,
  register,
}: {
  def: ToggleDef;
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer rounded p-2 -mx-2 hover:bg-gray-50">
      <input
        type="checkbox"
        className="mt-0.5"
        {...register(def.name as never)}
      />
      <span>
        <span className="text-sm font-medium block">{def.label}</span>
        <span className="text-xs text-gray-500 block">{def.description}</span>
      </span>
    </label>
  );
}

function ComplianceField({
  control,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"];
}) {
  return (
    <div>
      <span className="label">Compliance requirements</span>
      <Controller
        control={control}
        name="input.compliance"
        render={({ field }) => (
          <div className="space-y-2">
            {complianceOptions.map((c) => {
              const checked = field.value?.includes(c.value as never) ?? false;
              return (
                <label
                  key={c.value}
                  className="flex items-start gap-3 cursor-pointer rounded p-2 -mx-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    onChange={(e) => {
                      const next = new Set(field.value ?? []);
                      if (e.target.checked) next.add(c.value as never);
                      else next.delete(c.value as never);
                      field.onChange(Array.from(next));
                    }}
                  />
                  <span>
                    <span className="text-sm font-medium block">{c.label}</span>
                    <span className="text-xs text-gray-500 block">{c.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      />
    </div>
  );
}
