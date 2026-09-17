export const userId='11111111-1111-4111-8111-111111111111';
export const jobId='22222222-2222-4222-8222-222222222222';
export const token='33333333-3333-4333-8333-333333333333';
export function document() {
  return {
    title:'Préparer une histoire personnalisée pour deux enfants',slug:'histoire-pour-deux-enfants',
    description:'Des pistes concrètes pour préparer une histoire à lire ensemble, choisir les personnages et adapter le récit aux goûts de chaque enfant.',
    introduction:'Voici une méthode de préparation à adapter à chaque famille.',
    sections:[1,2,3].map(n=>({heading:`Étape ${n}`,paragraphs:[('Demandez aux enfants de choisir un personnage et un lieu pour construire ensemble le récit. ').repeat(13)],source_ids:[n%2+1]})),
    faq:[{question:'Peut-on choisir le décor ?',answer:'Oui, proposez plusieurs lieux.'},{question:'Faut-il lire à voix haute ?',answer:'Choisissez la manière qui convient à votre famille.'}],
    related_paths:['/apercu'],sources:[1,2].map(id=>({id,url:`https://example.org/source-${id}`,title:`Source ${id}`,checked_at:'2026-09-17T12:00:00Z'})),
  };
}
export function response(value,annotations=[]) {
  return {status:'completed',id:'resp_test',usage:{input_tokens:10,output_tokens:20},output:[{type:'message',content:[{type:'output_text',text:typeof value==='string'?value:JSON.stringify(value),annotations}]}]};
}
export function res() {
  return {statusCode:200,headers:{},body:null,setHeader(k,v){this.headers[k]=v;return this;},status(v){this.statusCode=v;return this;},json(v){this.body=v;return this;},send(v){this.body=v;return this;},end(){return this;}};
}
