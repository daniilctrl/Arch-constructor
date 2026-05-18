"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { InputSchema, type Input } from "@arch/core";
import { complianceOptions, type SelectOption, type ToggleDef } from "@/lib/fields";

export const FormSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  input: InputSchema,
});
export type FormValues = z.infer<typeof FormSchema>;

export function NameField({
  register,
}: {
  register: UseFormRegister<FormValues>;
}) {
  return (
    <section className="section">
      <h2>Name this design</h2>
      <input
        id="name"
        className="input"
        placeholder="e.g. Photo sharing service"
        {...register("name")}
      />
      <p className="text-xs text-gray-500 mt-1">
        Optional. Used for the saved page title.
      </p>
    </section>
  );
}

export function SelectField({
  name,
  question,
  options,
  register,
}: {
  name: string;
  question: string;
  options: readonly SelectOption[];
  register: UseFormRegister<FormValues>;
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

export function Slider({
  name,
  question,
  options,
  control,
}: {
  name: string;
  question: string;
  options: readonly SelectOption[];
  control: Control<FormValues>;
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
                  className={i === idx ? "text-gray-700 font-medium" : ""}
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

export function ToggleField({
  def,
  register,
}: {
  def: ToggleDef;
  register: UseFormRegister<FormValues>;
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

export function ComplianceField({
  control,
}: {
  control: Control<FormValues>;
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

// Re-export Input type for convenience
export type { Input };
