export interface SamplePage {
  page_number: number
  text: string
  image_url: string
}

export interface SampleBookData {
  id: string
  title: string
  style: string
  emoji: string
  pages: SamplePage[]
}

const BASE = 'https://gmrlijhmwltpndeytacj.supabase.co/storage/v1/object/public/books'

export const SAMPLE_BOOKS: SampleBookData[] = [
  {
    id: '06c4e0c9-c53f-40ce-b4f2-ebd79d563688',
    title: 'Louis et l\'Océan',
    style: 'aquarelle',
    emoji: '🌊',
    pages: [
      { page_number: 1, text: "Louis est à la plage, ses petits pieds dans le sable chaud. Il regarde l'océan bleu, si grand et mystérieux. « Que se cache-t-il là-dessous ? » se demande-t-il, les yeux brillants.", image_url: `${BASE}/06c4e0c9-c53f-40ce-b4f2-ebd79d563688/page_1.png` },
      { page_number: 2, text: "Soudain, Louis aperçoit une ombre verte flotter doucement à la surface de l'eau. Est-ce une algue, ou autre chose ? Sa curiosité est piquée au vif !", image_url: `${BASE}/06c4e0c9-c53f-40ce-b4f2-ebd79d563688/page_2.png` },
      { page_number: 3, text: "L'ombre s'approche, et surprise ! C'est une grande tortue marine avec un sourire gentil. « Bonjour Louis, je m'appelle Toby », dit la tortue d'une voix douce.", image_url: `${BASE}/06c4e0c9-c53f-40ce-b4f2-ebd79d563688/page_3.png` },
      { page_number: 4, text: "Louis est ravi de rencontrer Toby ! « L'océan est-il plein de secrets ? » demande Louis avec enthousiasme. Toby hoche la tête avec un clin d'œil malicieux.", image_url: `${BASE}/06c4e0c9-c53f-40ce-b4f2-ebd79d563688/page_4.png` },
      { page_number: 5, text: "« Viens avec moi, Louis, je vais te montrer un petit secret », dit Toby. Ils nagent un peu plus loin, et Louis voit une petite lueur brillante au fond.", image_url: `${BASE}/06c4e0c9-c53f-40ce-b4f2-ebd79d563688/page_5.png` },
    ],
  },
  {
    id: 'ee41ba00-5d5d-40ff-ba96-33dbc18f288e',
    title: 'Louis et l\'Aventure',
    style: 'aquarelle',
    emoji: '🐿️',
    pages: [
      { page_number: 1, text: "Aujourd'hui, Louis joue dans son beau jardin avec son ourson préféré, Teddy. Le soleil brille et ils construisent une grande tour de cubes colorés.", image_url: `${BASE}/ee41ba00-5d5d-40ff-ba96-33dbc18f288e/page_1.png` },
      { page_number: 2, text: "Mais oh là là ! Quand Louis regarde, Teddy n'est plus là ! Louis cherche partout, derrière les fleurs, sous le banc... mais Teddy est introuvable. Louis est un peu triste.", image_url: `${BASE}/ee41ba00-5d5d-40ff-ba96-33dbc18f288e/page_2.png` },
      { page_number: 3, text: "Soudain, une petite noisette roule près du pied de Louis. C'est Noisette l'écureuil ! Elle voit le visage un peu chagrin de Louis et semble comprendre.", image_url: `${BASE}/ee41ba00-5d5d-40ff-ba96-33dbc18f288e/page_3.png` },
      { page_number: 4, text: "Noisette se met à gigoter et à sauter, puis elle pointe sa petite patte vers un coin du jardin, comme si elle voulait dire : \"Viens par ici, Louis !\".", image_url: `${BASE}/ee41ba00-5d5d-40ff-ba96-33dbc18f288e/page_4.png` },
      { page_number: 5, text: "Louis suit Noisette. La petite écureuil court vite et montre une empreinte de patte sur la terre humide, juste à côté d'une petite flaque brillante.", image_url: `${BASE}/ee41ba00-5d5d-40ff-ba96-33dbc18f288e/page_5.png` },
    ],
  },
  {
    id: '3f49a53b-8bc3-4cea-bcb1-b0ba0f1b4fca',
    title: 'Pepito et le Courage',
    style: 'conte',
    emoji: '🌙',
    pages: [
      { page_number: 1, text: "Salut Pepito ! Connais-tu Pipo ? C'est un adorable petit chien avec une queue toute douce. Pipo adore jouer avec toi dans le jardin, sous le grand soleil.", image_url: `${BASE}/3f49a53b-8bc3-4cea-bcb1-b0ba0f1b4fca/page_1.png` },
      { page_number: 2, text: "Mais quand le soleil commence à descendre et que le ciel devient orange et rose, Pipo devient un peu inquiet. Ses grandes oreilles se penchent un peu.", image_url: `${BASE}/3f49a53b-8bc3-4cea-bcb1-b0ba0f1b4fca/page_2.png` },
      { page_number: 3, text: "Quand la nuit est là, Pipo a un peu peur du noir, Pepito. Il se cache souvent sous la couverture. Mais ce soir, une toute petite lumière apparaît près de la fenêtre !", image_url: `${BASE}/3f49a53b-8bc3-4cea-bcb1-b0ba0f1b4fca/page_3.png` },
      { page_number: 4, text: "C'est Lumi, une petite luciole brillante ! Elle invite Pipo à venir explorer la nuit. « Viens Pipo, la nuit est pleine de merveilles ! » dit Lumi.", image_url: `${BASE}/3f49a53b-8bc3-4cea-bcb1-b0ba0f1b4fca/page_4.png` },
      { page_number: 5, text: "Pipo a un peu peur, Pepito. Mais Lumi lui sourit de sa petite lumière. Elle dit que le courage, c'est d'essayer même quand on a peur. Pipo prend une grande inspiration.", image_url: `${BASE}/3f49a53b-8bc3-4cea-bcb1-b0ba0f1b4fca/page_5.png` },
    ],
  },
]

export const SAMPLE_BOOK_MAP = Object.fromEntries(SAMPLE_BOOKS.map(b => [b.id, b]))
