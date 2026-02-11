export default function calcularPercentil(valor, universo) {
  if (!universo.length) return 0;

  const menores = universo.filter(v => v <= valor).length;
  return Math.round((menores / universo.length) * 100);
}
