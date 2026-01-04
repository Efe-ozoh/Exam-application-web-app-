
  
  const jambScoreCalculator = ( examYear,  subject ) => {

    let score = 0;

    if(Number(examYear) > 2016){

            if(subject?.toLowerCase() === "english"){
                score += 1.67
            }else {
                score += 2.5
            }

    } else{
       score += 2;
    }

    return score;
    

  };

  export default jambScoreCalculator;