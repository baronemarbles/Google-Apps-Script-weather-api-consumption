const coordenadas_cidades=[
    {
        nome:"Santos",
        lat:-23.944841,
        lon:-46.330376
    },
    
    {   nome:"cubatao",
        lat:-23.8956,
        lon:-46.4256
    },

    {   nome:"praiaGrande",
        lat:-23.99989,
        lon:-46.41415
    },
    
    {   nome:"saoVicente",
        lat:-23.96707,
        lon:-46.38366
    },

    {   nome:"guaruja",
        lat:-23.99412,
        lon:-46.25743
    },

    {   nome:"campinas",
        lat:-22.9,
        lon:-47.06
    },

    {   nome:"hortolandia",
        lat:-22.858,
        lon:-47.200
    },

    {   nome:"indaiatuba",
        lat:-23.08765,
        lon:-47.22295
    },

    {   nome:"jaguariuna",
        lat:-22.706,
        lon:-46.986
    },

    {   nome:"novaOdessa",
        lat:-22.78,
        lon:-47.3
    },

    {   nome:"paulinia",
        lat:-22.761,
        lon:-47.154
    },

    {   nome:"sumare",
        lat:-22.822,
        lon:-47.267
    },

    {   nome:"valinhos",
        lat:-22.97,
        lon:-46.99
    },

    {   nome:"vinhedo",
        lat:-23.030,
        lon:-46.975
    },

    {   nome:"mongagua",
        lat:-24.0875,
        lon:-46.628889
    },

    {   nome:"peruibe",
        lat:-24.3173,
        lon:-46.9956
    },

    {   nome:"itanhaem",
        lat:-24.1835,
        lon:-46.7895
    },

]
const weatherApiK= "suaChave";
let loopApiUrl="http://api.weatherapi.com/v1/forecast.json?key="+weatherApiK+"&q=";

const options = {
    method: "GET"
};

const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName("tabelaDados");

let ini = 1;
let fim = 11;
let indexVert_idCoordenada = 5;
let indexVert_idNome = 1;
let colunasValoradas=["B","C","D"];

function arredondar(temp){
  if((temp-Math.trunc(temp))>.5){
    Logger.log("Arrendondou pra cima");
    return Math.round(temp);
  }
  else if((temp-Math.trunc(temp))<=.5){
    Logger.log("Arrendondou pra baixo");
    return Math.floor(temp);
  }
}

function getFormulaProcV(indiceCol,indexVert_idCord){
  return `=VLOOKUP(${indiceCol}${indexVert_idCord}; 'condição'!B2:E25; 4; FALSE)`;
}

function getFormulaProcV_Nome(nomeCidade){
  return `=VLOOKUP("${nomeCidade}"; 'nomes'!A2:B18; 2; FALSE)`;
}

function getFormulaProcV_Data(dia_nm){
  let dia_nm_partido = dia_nm.split('-');

  return `=UPPER(TEXT(DATE(${dia_nm_partido[0]};${dia_nm_partido[1]};${dia_nm_partido[2]});"dddd"))`;
}


function printInSheet(response,sheet,intervalo_inicio,intervalo_fim){
  let nomeCidade = response.location.name;
  let range=sheet.getRange(`A${intervalo_inicio}:D${intervalo_fim}`);
  range.clearFormat();

  range.setValues([
    ["Nome: ",getFormulaProcV_Nome(response.location.name),response.forecast.forecastday[1].date,response.forecast.forecastday[2].date],
    ["Dia: ",getFormulaProcV_Data(response.forecast.forecastday[0].date),getFormulaProcV_Data(response.forecast.forecastday[1].date),getFormulaProcV_Data(response.forecast.forecastday[2].date)],
    ["Temperatura Atual: ",arredondar(response.current.temp_c),"-","-"],
    ["Condição: ",response.current.condition.text,response.forecast.forecastday[1].day.condition.text,response.forecast.forecastday[2].day.condition.text],
    ["Id Condição: ",response.current.condition.code,response.forecast.forecastday[1].day.condition.code,response.forecast.forecastday[2].day.condition.code],
    ["Link icone API: ",("https:"+response.current.condition.icon),("https:"+response.forecast.forecastday[1].day.condition.icon),("https:"+response.forecast.forecastday[2].day.condition.icon)],
    ["Link Icone VTV: ",getFormulaProcV(colunasValoradas[0],indexVert_idCoordenada),getFormulaProcV(colunasValoradas[1],indexVert_idCoordenada),getFormulaProcV(colunasValoradas[2],indexVert_idCoordenada)],
    ["Umidade: ",response.current.humidity,response.forecast.forecastday[1].day.avghumidity,response.forecast.forecastday[2].day.avghumidity],
    ["Temperatura Máxima(Hoje): ",arredondar(response.forecast.forecastday[0].day.maxtemp_c),arredondar(response.forecast.forecastday[1].day.maxtemp_c),arredondar(response.forecast.forecastday[2].day.maxtemp_c)],
    ["Temperatura Mínima(Hoje): ",arredondar(response.forecast.forecastday[0].day.mintemp_c),arredondar(response.forecast.forecastday[1].day.mintemp_c),arredondar(response.forecast.forecastday[2].day.mintemp_c)],
    ["Chance de chuva: ",response.forecast.forecastday[0].day.daily_chance_of_rain,response.forecast.forecastday[1].day.daily_chance_of_rain,response.forecast.forecastday[2].day.daily_chance_of_rain]
  ]);
  sheet.getRange(`B${intervalo_inicio}:D${intervalo_fim}`).setNumberFormat("0");
  sheet.getRange(`C${intervalo_inicio}:D${intervalo_inicio}`).setNumberFormat("yyyy-mm-dd");
  // sheet.getRange(`D${26}:D${26}`).setFormula("=VLOOKUP(B"+indexVert_idCoordenada+";'condição'!B2:E25;4;FALSO)")
  
}

function getWeatherData(cidades,apiUrl,ss){

  for (cidade in cidades){
    Logger.log(cidades[cidade].nome);
    Logger.log(`${apiUrl}${cidades[cidade].lat},${cidades[cidade].lon}&lang=pt`);
    let response = UrlFetchApp.fetch(
    `${apiUrl}${cidades[cidade].lat},${cidades[cidade].lon}&days=3`
    );
    Logger.log("Hey, this is the reponse of the getWeatherData Function request: "+response);
    
    printInSheet(JSON.parse(response),ss,ini,fim);
    ini=ini+12;
    fim=fim+12;
    indexVert_idCoordenada+=12;

    Logger.log("Fim da resposta da cidade "+cidades[cidade].nome);
  }
}


function myFunction() {
  let response = UrlFetchApp.fetchAll([loopApiUrl+coordenadas_cidades[0].lat+","+coordenadas_cidades[0].lon,
  loopApiUrl+coordenadas_cidades[1].lat+","+coordenadas_cidades[1].lon]);


  getWeatherData(coordenadas_cidades,loopApiUrl,sheet);


}
