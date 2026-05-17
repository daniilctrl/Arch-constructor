import InputForm from "@/components/InputForm";

export default function NewDesignPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New design</h1>
      <p className="text-gray-700 mb-4 text-sm">
        Tell us about your project. We'll synthesize an architecture from the rules.
      </p>
      <InputForm />
    </div>
  );
}
