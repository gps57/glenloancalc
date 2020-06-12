const myChart = document.getElementById('myChart').getContext('2d');
const calcButton = document.querySelector("#calcButton");
const loanAmountArea = document.getElementById("loanAmountId");
const loanTermArea = document.getElementById("loanTermId");
const loanRateArea = document.getElementById("loanRateId");
const chartArea = document.querySelector("#chartArea");
const formatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})

let chartLabels = ['Principal', 'Interest'];
let tableHeaders = ['Month', 'Payment', 'Principal', 'Interest', 'Total Interest', 'Remaining Balance']
let bgcolors = ['blue', 'red'];
let lifetimeInt = 0;
let loanAmount = 0;
let monthlyPmt = 0;
var lcChart;
let chartData = [];

function buildChart() {
    // Global chart options
    Chart.defaults.global.defaultFontFamily ='Lato';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#777';

    lcChart = new Chart(myChart, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets:[{
                label:'Totals',
                //data:[loanAmount, lifetimeInt],
                data:chartData,
                backgroundColor:['blue', 'red'],
                borderWidth:1,
                borderColor:'#777',
                hoverBorderWidth: 2,
                hoverBorderColor: '#000'
            }]
        },  
        options: {
            title:{
                display: true,
                text: 'Lifetime Totals for Loan',
                fontSize: 25
            },
            legend:{
                display:true,
                position:'right',
                labels:{
                    fontColor:'#000'
                },
                layout:{
                    padding:{left:0,right:0,bottom:0,top:0}
                }
            },
            tooltips:{
                enabled:true // set to false if you don't want them
            }
    }
    });
} // end buildChart()


// Function buildTable()
function buildTable(){
    let myhtml = `
    <div id="tableContainer" class="row">
        <div class="col-sm">
            <table id="lcTable" class="table table-striped table-bordered">
                <thead>
                    <tr id="tableHeaders">
                    </tr>
                </thead>
                <tbody id="tableBody">
                </tbody>
            </table>
        </div>
    </div>
    `;

    // insert the basic table structure
    let pcTag = document.getElementById("pageContainer");
    pcTag.insertAdjacentHTML("beforeend", myhtml);

    // insert the table headers
    tableHeaders.forEach(addTableHeaders);

    // now insert the data into the table body
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    let remainingBalance = loanAmount - totalPrincipalPaid;
    for(let i=1; i<=loanTermArea.value; i++) {
        // some data we'll need to keep track of as we loop through
        let interestAmount = remainingBalance * loanRateArea.value/1200;
        let principalAmount = monthlyPmt - interestAmount;
        let rowId = "row" + i;

        // some totals we're keeping track of
        totalPrincipalPaid += monthlyPmt - interestAmount;
        totalInterestPaid += interestAmount;
        remainingBalance = loanAmount - totalPrincipalPaid;

        // insert the table row element
        myhtml = '<tr id="' + rowId + '">';  
        
        // this next line will add the closing tag automatically
        // - didn't know that until I tried to add it again      
        document.getElementById("tableBody").insertAdjacentHTML("beforeend", myhtml);

        // now insert data for these rows
        let row = document.getElementById(rowId);
        
        // insert the payment number
        myhtml = "<td>" + i + "</td>"
        row.insertAdjacentHTML("beforeend", myhtml);

        // insert the Payment amount
        myhtml = "<td>" + formatter.format(monthlyPmt) + "</td>"
        row.insertAdjacentHTML("beforeend", myhtml);

        // insert the Principal amount
        myhtml = "<td>" + formatter.format(principalAmount) + "</td>"
        row.insertAdjacentHTML("beforeend", myhtml);

        // insert the Interest payment
        myhtml = "<td>" + formatter.format(interestAmount) + "</td>"
        row.insertAdjacentHTML("beforeend", myhtml);

        // insert the total interest paid
        myhtml = "<td>" + formatter.format(totalInterestPaid) + "</td>"
        row.insertAdjacentHTML("beforeend", myhtml);

        // insert the remaining balance
        myhtml = "<td>" + formatter.format(remainingBalance) + "</td>"
        row.insertAdjacentHTML("beforeend", myhtml);
//        console.log(document.getElementById("tableBody"))

    } // end for loop
    
} // end buildTable()

function addTableHeaders(item) {
    document.getElementById("tableHeaders").insertAdjacentHTML("beforeend", `<th>${item}</th>`);
}

function addTableBody(pmtNum) {

}

// Function calculate
//  calculates the monthly loan payment
function calculate(e) {
    
    if(loanAmount!=0){
        lifetimeInt = 0;
        loanAmount = 0;
        monthlyPmt = 0;
        document.getElementById("tableContainer").remove();
    }

    e.preventDefault();

    let loanRate = loanRateArea.value;
    let pmtsCount = loanTermArea.value;

    let rate = loanRate/1200;  
    let numerator = rate * ((1 + rate)**pmtsCount);
    let denominator = ((1 + rate)**pmtsCount) - 1;

    loanAmount = loanAmountArea.value;
    monthlyPmt = loanAmount * (numerator/denominator);
    lifetimeInt = (monthlyPmt * pmtsCount) - loanAmount;
    formatter.format(monthlyPmt)
    chartData = [parseFloat(loanAmount).toFixed(2), lifetimeInt.toFixed(2)];

    if (loanAmount != 0 ) {
        if(lcChart){
            // I only have one dataset, so just have to give it the new data
            lcChart.data.datasets[0].data = chartData;

            // update the chart with no animation
            lcChart.update();
        } else {
            buildChart();
        }
        buildTable();

    }
}

calcButton.addEventListener("click", calculate, false);
