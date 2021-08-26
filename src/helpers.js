function helpers() {
    function sortWithNumbers(data){
        return data.sort(function (a, b) {
            return (Number(a.match(/(\d+)/g)[0]) - Number((b.match(/(\d+)/g)[0])));
        });
    }

    function findLastIndexOfArray(array) {
        return array[array.length - 1];
    }

    function transformStringToArray(stringData) {
        stringData = stringData.split(',');
        stringData = stringData.map((e) => {
            return parseInt(e, 10);
        });

        return stringData;
    }

    function convertNumericMonthsToExtense(m, english=false){
        let monthsDict = {}

        if(english){
            monthsDict = {
                '01': "January",
                '02': "February",
                '03': "March",
                '04': "April",
                '05': "May",
                '06': "June",
                '07': "July",
                '08': "August",
                '09': "September",
                '10': "October",
                '11': "November",
                '12': "December"
            }
        }else{
            monthsDict = {
                '01': 'Janeiro',
                '02': 'Fevereiro',
                '03': 'Março',
                '04': 'Abril',
                '05': 'Maio',
                '06': 'Junho',
                '07': 'Julho',
                '08': 'Agosto',
                '09': 'Setembro',
                '10': 'Outubro',
                '11': 'Novembro',
                '12': 'Dezembro'
            }
        }

        m = m.toString().padStart(2, '0');

        return monthsDict[m];
    }

    function getCurrentDate() {
        let today = new Date();

        today.getFullMonth = () => {
            const months = [
                'Janeiro',
                'Fevereiro',
                'Março',
                'Abril',
                'Maio',
                'Junho',
                'Julho',
                'Agosto',
                'Setembro',
                'Outubro',
                'Novembro',
                'Dezembro'
            ]

            return months[today.getMonth()];
        }

        return today;
    }

    function toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    function calculateMonth(m1, m2, operation) {
        console.log('*******************************')
        console.log('mes inicial', m1)
        console.log('quantidade subtraida', m2)

        let yearsElapsedy = 0;
        if(operation === 'sub'){
            for (let i = 0; i < m2; i++) {
                m1 -= 1;
    
                if(m1 < 1){
                    m1 = 12;
                    yearsElapsedy += 1;
                }
            }
        }else{
            for (let i = 0; i < m2; i++) {
                m1 += 1;
    
                if(m1 > 12){
                    m1 = 1;
                    yearsElapsedy += 1;
                }
            }
        }

        console.log('yearsElapsedy = ', yearsElapsedy)
        console.log('mes atual = ', m1)

        return {
            currentMonth: parseInt(m1),
            yearsElapsedy: parseInt(yearsElapsedy)
        }
    }

    function convertDateToUTC(date) { 
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); 
    }

    return {
        sortWithNumbers,
        findLastIndexOfArray,
        transformStringToArray,
        getCurrentDate,
        calculateMonth,
        convertDateToUTC,
        convertNumericMonthsToExtense,
        toTitleCase
    }
}

export default helpers;