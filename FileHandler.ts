import pdf from 'pdf-parse';

export async function getTextFromPDFBuffer(b:Buffer){
    let data=await pdf(b);
    return data.text;
}