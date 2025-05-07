// Start Number const
const SN_UPLOAD = 0
const SN_TIMEOUT = 1
const SN_HIDE = 2

function prepareAthlete(show, athlete) {
    if(show === 0) {  //set input
        document.getElementById('athlete_name_text').style.display = 'none'
        document.getElementById('athlete_name_input').style.display = 'inline'
        document.getElementById('age_text').style.display = 'none'
        document.getElementById('age_input').style.display = 'inline'
        document.getElementById('sex_text').style.display = 'none'
        document.getElementById('sex_input').style.display = 'inline'
        document.getElementById('athlete_name_row').style.display = 'flex'
        document.getElementById('age_row').style.display = 'flex'
        document.getElementById('sex_row').style.display = 'flex'
        // document.getElementById('register_row').style.display = 'flex'
    } else if(show === 1) { //show text
        document.getElementById('athlete_name_input').style.display = 'none'
        document.getElementById('athlete_name_text').innerHTML = athlete.name
        document.getElementById('athlete_name_text').style.display = 'inline'
        document.getElementById('age_input').style.display = 'none'
        document.getElementById('age_title').innerHTML = "Age group:"
        document.getElementById('age_text').innerHTML = athlete.age
        document.getElementById('age_text').style.display = 'inline'
        document.getElementById('sex_input').style.display = 'none'
        document.getElementById('sex_text').innerHTML = athlete.sex == "M" ? 'Male' : 'Female'
        document.getElementById('sex_text').style.display = 'inline'
        document.getElementById('athlete_name_row').style.display = 'flex'
        document.getElementById('age_row').style.display = 'flex'
        document.getElementById('sex_row').style.display = 'flex'
        // document.getElementById('register_row').style.display = 'flex'
    } else { //hide
        document.getElementById('athlete_name_row').style.display = 'none'
        document.getElementById('age_row').style.display = 'none'
        document.getElementById('sex_row').style.display = 'none'
        // document.getElementById('register_row').style.display = 'none'
    }
}

function preparePromocode(show, str) {
    if(str === undefined) {
        document.getElementById('promocode_text').style.display = 'none'
        document.getElementById('promocode_input').style.display = 'inline'
        if(show === true) {
            document.getElementById('promocode_row').style.display = 'flex'
        } else {
            document.getElementById('promocode_row').style.display = 'none'
        }
    } else {
        document.getElementById('promocode_input').style.display = 'none'
        document.getElementById('promocode_text').innerHTML = str
        document.getElementById('promocode_text').style.display = 'inline'
        document.getElementById('promocode_row').style.display = 'flex'
    }
}

function preparePrice(price) {
    if(price === undefined) {
        document.getElementById('race_price_row').style.display = 'none'
    } else {
        let usd = `${Math.round(price * usdpol)}$`;
        document.getElementById('race_price').innerHTML = `${price} POL <img src="/design/help.svg" onClick="Swal.fire({icon:'question',title:'What is POL',html:'POL is the cryptocurrency used on the Polygon blockchain. It is like the money you use to pay for things on the Polygon network.<p>${price} POL is about equal to ${usd}</p>'})" alt="help" />`
        document.getElementById('race_price_row').style.display = 'flex'
    }
}

function prepareStartNumber(show, data) {
    var number_display = 'none'
    if(data !== undefined 
        && data.athlete !== undefined 
        && data.athlete.bib !== undefined 
        && data.race.id !== undefined) {
        document.getElementById('start_number_text').innerHTML = data.athlete.bib
        // var host = '<%= process.env.HOST_URL %>'
        document.getElementById('start_number_link').href = `/bib?raceId=${data.race.id}&bib=${data.athlete.bib}`
        number_display = 'flex'
        if(data.tracks !== undefined && data.tracks.length > 0) {
            var tracks = data.tracks.map((track) => {
                return `<div><h2 class="rowValue">${track.date} : <span class="filename">${track.original_file}</span></h2></div>`
            }).join('')
            document.getElementById('tracks_value').innerHTML = tracks
            document.getElementById('tracks_row').style.display = 'flex'
        }
    }
    if(show === SN_UPLOAD) { 
        console.log("prepareStartNumber: SN_UPLOAD")
        document.getElementById('start_number_row').style.display = number_display
        document.getElementById('tracks_row').style.display = number_display
        document.getElementById('upload_row').style.display = 'flex'
        document.getElementById('upload_box').style.background = '#E5E5E5'
        document.getElementById('upload_box').innerHTML = '<h1>Upload on track</h1><p>drag file here</p><p style="text-decoration:underline">or select file from disk</p>'
    } else if(show === SN_TIMEOUT) {
        console.log("prepareStartNumber: SN_TIMEOUT")
        document.getElementById('start_number_row').style.display = number_display
        document.getElementById('tracks_row').style.display = number_display
        document.getElementById('upload_row').style.display = 'flex'
        document.getElementById('upload_box').style.background = '#EAF4FF'
        document.getElementById('upload_box').innerHTML = '<h1 style="color:#FF0303">Time out</h1>'
    } else if(show === SN_HIDE) {
        console.log("prepareStartNumber: SN_HIDE")
        document.getElementById('start_number_row').style.display = 'none'
        document.getElementById('tracks_row').style.display = 'none'
        document.getElementById('upload_row').style.display = 'none'
    }
    document.getElementById('stateContentContainer').style.display = show > 1 ? 'none' : 'flex'
}

function prepareUploadRow(show) {
    if(show === true) {
        document.getElementById('upload_row').style.display = 'flex'
    } else {
        document.getElementById('upload_row').style.display = 'none'
    }
}

function hideAll() {
    prepareAthlete(2)
    preparePromocode(false)
    // prepareUploadRow(false)
    document.getElementById('upload_row').style.display = 'none'
    // prepareStartNumber(SN_TIMEOUT)
}

function showNft() {
    document.getElementById('nftDetail').style.display = 'flex'
}

function prepareScreen(data) {
    console.log("prepareScreen:", data.status, ", active:", data.race.active)
    if(data.race.active === true) {
        switch (data.status) {
            case 1: //Это новый атлет, не зарегистрированный в блокчейне
                prepareAthlete(0)
                preparePromocode(true)
                preparePrice(data.race.price)
                prepareStartNumber(SN_HIDE)
                document.getElementById('nftDetail').style.display = 'none'
                document.getElementById('connection_row').style.display = 'none'
                document.getElementById('register_row').style.display = 'flex'
                break;
            case 2: //Это зарегистрированный в блокчейне атлет, но не внесший депозит за этот забег
                prepareAthlete(1, data.athlete)
                preparePromocode(true)
                preparePrice(data.race.price)
                prepareStartNumber(SN_HIDE)
                document.getElementById('nftDetail').style.display = 'none'
                document.getElementById('connection_row').style.display = 'none'
                document.getElementById('register_row').style.display = 'flex'
                break;
            case 3: //Зарегистрированный атлет, участвующий в забеге
                prepareAthlete(1, data.athlete)
                preparePromocode(false, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_UPLOAD, data)
                document.getElementById('nftDetail').style.display = 'none'
                document.getElementById('connection_row').style.display = 'none'
                document.getElementById('register_row').style.display = 'none'
                break;
            case 4: //Зарегистрированный атлет, участвующий в забеге, отправивший трек на подтверждение
                //только здесь отображаются треки data.tracks {date: 20251231, original_file: filename}
                prepareAthlete(1, data.athlete)
                preparePromocode(false, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_UPLOAD, data)
                document.getElementById('nftDetail').style.display = 'none'
                document.getElementById('connection_row').style.display = 'none'
                document.getElementById('register_row').style.display = 'none'
                break;
            case 5: //Зарегистрированный атлет, участвующий в забеге, проебавший время
                prepareAthlete(1, data.athlete)
                preparePromocode(false, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_UPLOAD, data)
                document.getElementById('nftDetail').style.display = 'none'
                document.getElementById('connection_row').style.display = 'none'
                document.getElementById('register_row').style.display = 'none'
                break;
            case 6: //Зарегистрированный атлет, участвующий в забеге, получивший медаль финишера (NFT)
                prepareAthlete(1, data.athlete)
                preparePromocode(false, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_UPLOAD, data)
                showNft(data)
                document.getElementById('connection_row').style.display = 'none'
                document.getElementById('register_row').style.display = 'none'
                break;
            case 10: //unknow user, не подключенный кошелек
                hideAll()
                preparePrice(data.race.price)
                prepareStartNumber(SN_HIDE)
                document.getElementById('connection_row').style.display = 'flex'
                document.getElementById('register_row').style.display = 'none'
                // if(address) {
                //     prepareAthlete(0)
                //     preparePromocode(true)
                //     preparePrice(data.race.price)
                //     prepareStartNumber(SN_HIDE)
                //     document.getElementById('connection_row').style.display = 'none'
                // }
                break;
        }
    } else { //уже забег завершен
        document.getElementById('connection_row').style.display = 'none'
        document.getElementById('register_row').style.display = 'none'
        switch (data.status) {
            case 1:
            case 2:
            case 10:
                hideAll()
                preparePrice()
                prepareStartNumber(SN_TIMEOUT)
                break;
            case 3:
                prepareAthlete(1, data.athlete)
                preparePromocode(false, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_TIMEOUT, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 4:
                prepareAthlete(1, data.athlete)
                preparePromocode(false, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_TIMEOUT, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 5:
                prepareAthlete(1, data.athlete)
                preparePromocode(false, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_TIMEOUT, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 6:
                prepareAthlete(1, data.athlete)
                preparePromocode(false, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_TIMEOUT, data)
                showNft(data)
                break;
        }
    }
    // if(address) {
    //     document.getElementById('connection_row').style.display = 'none'
    // }
}
