import PieBeeswarm from "./PieBeeswarm";

export default function Main({ summary }) {
  return (
    <main>
      <PieBeeswarm data={summary} />
    </main>
  );
}
