import {quoteCalc} from './calc.js';
import {readControls,getMargin,initControls} from './controls.js';
import {buildRateCard,updateBlended} from './ratecard.js';
import {buildMatrix,updateMatrix} from './matrix.js';
import {buildQuoteRows,updateQBRows,updateQuote,exportQuote} from './quote.js';
import {initNav} from './nav.js';
import {$} from './util.js';

function refreshQuote(){updateQuote(quoteCalc(readControls()));}
function recalc(){
  const mg=getMargin();
  updateBlended();
  updateMatrix(mg);
  updateQBRows(mg);
  refreshQuote();
}
/* Role selection / rename changes the matrix's columns, not just values. */
function rebuild(){buildMatrix(recalc);recalc();}

initNav();
buildRateCard({onValue:recalc,onStructure:rebuild});
buildMatrix(recalc);
buildQuoteRows(recalc);
initControls({onRecalc:recalc,onQuote:refreshQuote});
$('expBtn').addEventListener('click',()=>exportQuote(quoteCalc(readControls())));
recalc();
