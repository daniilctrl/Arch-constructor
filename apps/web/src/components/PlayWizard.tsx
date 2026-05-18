"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  useForm,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import type { Input } from "@arch/core";
import { defaultInput } from "@/lib/defaults";
import { fields, toggles } from "@/lib/fields";
import {
  ComplianceField,
  FormSchema,
  SelectField,
  Slider,
  ToggleField,
  type FormValues,
} from "./form-fields";

type Ctx = {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
};

type Chapter = {
  title: string;
  intro: string;
  render: (ctx: Ctx) => React.ReactNode;
};

const chapters: Chapter[] = [
  {
    title: "Team",
    intro:
      "Architecture isn't only about scale — it's also about who has to maintain it. Tell us about the team.",
    render: ({ control, register }) => (
      <div className="space-y-4">
        <Slider
          name="input.teamSize"
          question={fields.teamSize.question}
          options={fields.teamSize.options}
          control={control}
        />
        <SelectField
          name="input.teamExperience"
          question={fields.teamExperience.question}
          options={fields.teamExperience.options}
          register={register}
        />
      </div>
    ),
  },
  {
    title: "Scale & growth",
    intro:
      "How much traffic, how much data, how fast does it grow. These shape every infra decision downstream.",
    render: ({ control, register }) => (
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
        <ToggleField def={toggles.latencyCritical} register={register} />
      </div>
    ),
  },
  {
    title: "Data shape & access",
    intro:
      "What does your data look like, how strict are you about consistency, and what does the read/write mix look like?",
    render: ({ register }) => (
      <div className="space-y-3">
        <SelectField
          name="input.dataShape"
          question={fields.dataShape.question}
          options={fields.dataShape.options}
          register={register}
        />
        <SelectField
          name="input.consistency"
          question={fields.consistency.question}
          options={fields.consistency.options}
          register={register}
        />
        <SelectField
          name="input.readWriteRatio"
          question={fields.readWriteRatio.question}
          options={fields.readWriteRatio.options}
          register={register}
        />
      </div>
    ),
  },
  {
    title: "Product features",
    intro:
      "Each of these is a separate infrastructure decision in disguise.",
    render: ({ register }) => (
      <div className="space-y-2">
        <ToggleField def={toggles.realtime} register={register} />
        <ToggleField def={toggles.longRunningJobs} register={register} />
        <ToggleField def={toggles.fileStorage} register={register} />
        <ToggleField def={toggles.analytics} register={register} />
        <div className="mt-4">
          <SelectField
            name="input.search"
            question={fields.search.question}
            options={fields.search.options}
            register={register}
          />
        </div>
      </div>
    ),
  },
  {
    title: "Deployment & compliance",
    intro:
      "Where it runs and what regulations apply. Often dictated by the business more than by the architect.",
    render: ({ control, register }) => (
      <div className="space-y-4">
        <SelectField
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
    ),
  },
];

export type PlayWizardProps = {
  initial?: Input;
  onSubmit: (values: { input: Input }) => Promise<void>;
};

export default function PlayWizard({ initial, onSubmit }: PlayWizardProps) {
  const [chapter, setChapter] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", input: initial ?? defaultInput },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ input: values.input });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  });

  const total = chapters.length;
  const isLast = chapter === total - 1;
  const current = chapters[chapter]!;
  const progress = ((chapter + 1) / total) * 100;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Chapter {chapter + 1} of {total}
          </span>
          <span className="text-xs text-gray-500">{current.title}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded">
          <div
            className="h-full bg-gray-900 rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <section className="section">
        <h2>{current.title}</h2>
        <p className="text-sm text-gray-600 mb-4">{current.intro}</p>
        {current.render({ control, register })}
      </section>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => setChapter((c) => Math.max(0, c - 1))}
          disabled={chapter === 0}
          className="text-sm text-gray-600 disabled:opacity-30 hover:text-gray-900"
        >
          ← Back
        </button>
        {isLast ? (
          <button type="submit" disabled={submitting} className="btn">
            {submitting ? "Submitting..." : "Submit my design"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setChapter((c) => Math.min(total - 1, c + 1))}
            className="btn"
          >
            Next →
          </button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 pt-2">
        {chapters.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setChapter(i)}
            className={`w-2 h-2 rounded-full transition ${
              i === chapter
                ? "bg-gray-900"
                : i < chapter
                  ? "bg-gray-400"
                  : "bg-gray-200"
            }`}
            aria-label={`Go to chapter ${i + 1}`}
          />
        ))}
      </div>
    </form>
  );
}
