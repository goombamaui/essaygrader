import { Essay } from "./Tokenizer";

export default class Correction {
    static TokenSelection = Symbol("0");
    static SentenceSelection = Symbol("2");
    static EssaySelection = Symbol("3");

    essay:Essay;
    text:string;
    deduction:number;
    selection:symbol;
    token_start:number;
    token_end:number;
    highlight:boolean;
    constructor(essay:Essay,selection:symbol,text:string,deduction:number,token_start:number|string,
                token_end?:number|string,highlight?:boolean){
        this.essay=essay;
        this.text=text;
        this.deduction=deduction;
        this.token_start=typeof(token_start)=="number"?token_start:parseInt(token_start);
        this.token_end=typeof(token_end)=="number"?token_end:parseInt(token_end?token_end:""+token_start);
        this.highlight=!!highlight;
        this.selection=selection;
    }
    get typenum(){
        return parseInt(this.selection.description!);
    }
    getStartStop(){
        switch(this.selection){
            case Correction.SentenceSelection:
                return [this.essay.sentences[this.token_start].tokens[0].position,
                        this.essay.sentences[this.token_end].tokens[
                            this.essay.sentences[this.token_end].tokens.length-1
                        ].position];
                break;
            case Correction.EssaySelection:
                return [0,this.essay.tokens.length-1];
                break;
            case Correction.TokenSelection:
            default:
                return [this.token_start,this.token_end];
                break;
        }
    }
    toObject(){
        let r=this.getStartStop();
        return {
            token_start:r[0],
            token_end:r[1],
            description:this.text,
            deduction:this.deduction,
            highlight:this.highlight
        }
    }
    getSelectedPortion(){
        let r=this.getStartStop();
        let s="";
        if(this.highlight){
            for(let i=r[0];i<=r[1];i++){
                s+=this.essay.tokens[i].tok;
            }
        } else {
            s+=this.essay.tokens[r[0]].tok+"\n";
            s+=this.essay.tokens[r[1]].tok;
        }
        return s;
    }
}