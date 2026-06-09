import PieBeeswarm from "./PieBeeswarm/PieBeeswarm";

export default function Main({ summary }) {
  return (
    <main>
      <PieBeeswarm data={summary} />
    </main>
  );
}
