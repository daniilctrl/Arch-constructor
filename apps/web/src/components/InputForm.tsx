"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { Input } from "@arch/core";
import { defaultInput } from "@/lib/defaults";
import { fields, toggles } from "@/lib/fields";
import {
  ComplianceField,
  FormSchema,
  NameField,
  SelectField,
  Slider,
  ToggleField,
  type FormValues,
} from "./form-fields";

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
      {showName && <NameField register={register} />}

      <section className="section">
        <h2>Workload</h2>
        <div className="space-y-4">
          <Slider name="input.rps" question={fields.rps.question} options={fields.rps.options} control={control} />
          <Slider name="input.dataVolume" question={fields.dataVolume.question} options={fields.dataVolume.options} control={control} />
          <Slider name="input.growth" question={fields.growth.question} options={fields.growth.options} control={control} />
          <SelectField name="input.readWriteRatio" question={fields.readWriteRatio.question} options={fields.readWriteRatio.options} register={register} />
          <ToggleField def={toggles.latencyCritical} register={register} />
        </div>
      </section>

      <section className="section">
        <h2>Data</h2>
        <div className="space-y-3">
          <SelectField name="input.dataShape" question={fields.dataShape.question} options={fields.dataShape.options} register={register} />
          <SelectField name="input.consistency" question={fields.consistency.question} options={fields.consistency.options} register={register} />
        </div>
      </section>

      <section className="section">
        <h2>What it does</h2>
        <div className="space-y-2">
          <ToggleField def={toggles.realtime} register={register} />
          <ToggleField def={toggles.longRunningJobs} register={register} />
          <ToggleField def={toggles.fileStorage} register={register} />
          <ToggleField def={toggles.analytics} register={register} />
        </div>
        <div className="mt-4">
          <SelectField name="input.search" question={fields.search.question} options={fields.search.options} register={register} />
        </div>
      </section>

      <section className="section">
        <h2>Team & deployment</h2>
        <div className="space-y-4">
          <Slider name="input.teamSize" question={fields.teamSize.question} options={fields.teamSize.options} control={control} />
          <SelectField name="input.teamExperience" question={fields.teamExperience.question} options={fields.teamExperience.options} register={register} />
          <SelectField name="input.deployment" question={fields.deployment.question} options={fields.deployment.options} register={register} />
          <Slider name="input.budget" question={fields.budget.question} options={fields.budget.options} control={control} />
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
