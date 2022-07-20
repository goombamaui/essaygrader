import Correction from "./Correction";
import {Essay, Token} from "./Tokenizer";
const baseWords:string[] = require("an-array-of-english-words");
const otherWords:string[] = ["s"];

function binarysearch(w:string){
    let s=0,e=baseWords.length-1,m=0;
    while(s<=e){
        m=Math.floor((s+e)/2);
        if(w<baseWords[m])
            e=m-1;
        else if (w>baseWords[m])
            s=m+1;
        else
            return true;
    }
    return otherWords.indexOf(w)>-1;
}


export default class Grader{
    static nastynonos=["very","really","get","got","gotten","getting","gatten","book"];
    static prepositions=["of", "from", "before", "after", "during", "above", "below"];
    static GradeEssay(e:Essay):{0:number,1:Correction[]}{
        let score=100;
        let feedback:Correction[]=[];
        function ding(err:string,p:number,sy:symbol,token_start:number|string,token_end?:number|string,highlight?:boolean){
            score-=p;
            feedback.push(new Correction(e,sy,err,p,token_start,token_end,highlight));
        }
        let w:string;
        (e.words.length<500||e.words.length>1000 ) && ding("use the ***** word count please", 50,Correction.EssaySelection,0);
        e.words.forEach(l=>{
            w=l.tok;
            this.nastynonos.indexOf(w.toLowerCase())>=0 && ding("nasty nono", 1, Correction.TokenSelection,l.position);
            !binarysearch(w.toLowerCase()) && w[0].toUpperCase()!=w[0] && ding("not a word (contractions aren't words)",1,Correction.TokenSelection,l.position);
        })
        let prevStarts:string[] = [];
        let ind=0;
        let s;
        for(let i in e.sentences){
            let iter=parseInt(i) as number;
            s=e.sentences[iter];
            prevStarts.length>3&&prevStarts.shift();
            try{
                Grader.prepositions.indexOf(s.words[s.words.length-1].tok.toLowerCase())>0 && 
                        ding("Sentence ends in preposition", 5, Correction.TokenSelection, s.words[s.words.length-1].position);
                let st=s.words[0],first=st.tok.substring(0,1);
                first.toUpperCase()!=first&&ding("First word in sentence not upper case", 3, Correction.TokenSelection, st.position);
                ind=prevStarts.indexOf(st.tok.toLowerCase());
                ind>=0 && ding("Sentences near each other had same starting (less than 3 sentence gap)",3,
                        Correction.SentenceSelection,iter-(prevStarts.length-ind),iter,true);
                prevStarts.push(st.tok.toLowerCase());
            } catch(err){}
            iter++;
        }
        return [score,feedback];
    }
}
