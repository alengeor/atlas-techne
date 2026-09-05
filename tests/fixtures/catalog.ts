import { localized as l, mapSchema, type MapDocument } from '../../shared/model';

// Validation fixtures only. Never loaded by the application or shipped in its catalog.
export function demoCatalog(): MapDocument[] {
  return [mapSchema.parse({
    schemaVersion: 1, id: 'bd52a642-a61b-41ee-b938-78dc222bd5b4',
    title: l('Un espacio, distintas miradas', 'Um espaço, diferentes olhares', 'One space, different perspectives'),
    description: l('Alterná las imágenes del plano y superponé un recorrido. Todo permanece en su lugar.', 'Alterne as imagens da planta e sobreponha um percurso. Tudo permanece no lugar.', 'Switch between plan images and add a route overlay. Everything stays in place.'),
    width: 1440, height: 960,
    assets: [
      { id: 'asset-plan', path: 'fixtures/plan.svg', width: 1440, height: 960 },
      { id: 'asset-alternative', path: 'fixtures/plan-alternative.svg', width: 1440, height: 960 },
      { id: 'asset-route', path: 'fixtures/route.svg', width: 1440, height: 960 },
    ],
    layers: [
      { id: 'layer-plan', assetId: 'asset-plan', title: l('Plano general', 'Planta geral', 'General plan'), alt: l('Plano de cuatro salas alrededor de un corredor central.', 'Planta de quatro salas ao redor de um corredor central.', 'Plan of four rooms around a central corridor.'), kind: 'base', visibleByDefault: true, order: 0, transform: { scale: 1, x: 0, y: 0, opacity: 1 } },
      { id: 'layer-alternative', assetId: 'asset-alternative', title: l('Vista nocturna', 'Vista noturna', 'Night view'), alt: l('El mismo plano con una paleta oscura.', 'A mesma planta com uma paleta escura.', 'The same plan in a dark palette.'), kind: 'base', visibleByDefault: false, order: 1, transform: { scale: 1, x: 0, y: 0, opacity: 1 } },
      { id: 'layer-route', assetId: 'asset-route', title: l('Recorrido sugerido', 'Percurso sugerido', 'Suggested route'), alt: l('Recorrido desde la entrada hasta las salas A y D.', 'Percurso da entrada às salas A e D.', 'A route from the entrance to rooms A and D.'), kind: 'overlay', visibleByDefault: false, order: 2, transform: { scale: 1, x: 0, y: 0, opacity: 1 } },
    ],
    markers: [
      { id: 'marker-a', title: l('Punto de encuentro', 'Ponto de encontro', 'Meeting point'), description: l('Una ficha puede contar una historia, mostrar una imagen o acompañar un recorrido.\n\nProbá cambiar de idioma con esta ficha abierta: el mapa conserva su posición y sus capas.', 'Uma ficha pode contar uma história, mostrar uma imagem ou acompanhar um percurso.\n\nExperimente mudar de idioma com esta ficha aberta: o mapa mantém sua posição e suas camadas.', 'A detail card can tell a story, show an image or accompany a route.\n\nTry changing languages with this card open: the map keeps its position and active layers.'), position: { x: 0.3125, y: 0.34375 }, appearance: { kind: 'system', icon: 'pin', color: '#e6b65e' }, visible: true, layerIds: [], media: [
        { id: 'media-plan', kind: 'image', assetId: 'asset-plan', title: l('Plano general', 'Planta geral', 'General plan'), alt: l('Vista completa del plano de ejemplo.', 'Vista completa da planta de exemplo.', 'Full view of the example plan.') },
        { id: 'media-night', kind: 'image', assetId: 'asset-alternative', title: l('Otra perspectiva', 'Outra perspectiva', 'Another perspective'), alt: l('El plano con colores nocturnos.', 'A planta em cores noturnas.', 'The plan in night colors.') },
      ] },
      { id: 'marker-d', title: l('Un lugar para descubrir', 'Um lugar para descobrir', 'A place to discover'), description: l('Los marcadores se ubican sobre las imágenes y permanecen alineados al hacer zoom o cambiar de capa.', 'Os marcadores ficam sobre as imagens e permanecem alinhados ao ampliar ou mudar de camada.', 'Markers sit on the images and stay aligned when zooming or switching layers.'), position: { x: 0.6875, y: 0.66667 }, appearance: { kind: 'system', icon: 'star', color: '#66d5b0' }, visible: true, layerIds: [], media: [] },
    ],
  })];
}
