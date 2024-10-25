// Start Number const
const SN_UPLOAD = 0
const SN_TIMEOUT = 1
const SN_HIDE = 0

function prepareAthlete(show, athlete) {
    if(show === 0) {  //set input
        document.getElementById('athlete_name_text').style.display = 'none'
        document.getElementById('athlete_name_input').style.display = 'inline'
        document.getElementById('age_text').style.display = 'none'
        document.getElementById('age_input').style.display = 'inline'
        document.getElementById('gender_text').style.display = 'none'
        document.getElementById('gender_input').style.display = 'inline'
        document.getElementById('athlete_name_row').style.display = 'flex'
        document.getElementById('age_row').style.display = 'flex'
        document.getElementById('gender_row').style.display = 'flex'
    } else if(show === 1) { //show text
        document.getElementById('athlete_name_input').style.display = 'none'
        document.getElementById('athlete_name_text').innerHTML = athlete.name
        document.getElementById('athlete_name_text').style.display = 'inline'
        document.getElementById('age_input').style.display = 'none'
        document.getElementById('age_text').innerHTML = athlete.age
        document.getElementById('age_text').style.display = 'inline'
        document.getElementById('gender_input').style.display = 'none'
        document.getElementById('gender_text').innerHTML = athlete.sex == 1 ? 'male' : 'female'
        document.getElementById('gender_text').style.display = 'inline'
        document.getElementById('athlete_name_row').style.display = 'flex'
        document.getElementById('age_row').style.display = 'flex'
        document.getElementById('gender_row').style.display = 'flex'
    } else { //hide
        document.getElementById('athlete_name_row').style.display = 'none'
        document.getElementById('age_row').style.display = 'none'
        document.getElementById('gender_row').style.display = 'none'
    }
}

function preparePromocode(show, str) {
    if(show) {
        if(str === undefined) {
            document.getElementById('promocode_text').style.display = 'none'
            document.getElementById('promocode_input').style.display = 'inline'
            document.getElementById('promocode_row').style.display = 'flex'
        } else {
            document.getElementById('promocode_input').style.display = 'none'
            document.getElementById('promocode_text').innerHTML = str
            document.getElementById('promocode_text').style.display = 'inline'
        }
        document.getElementById('promocode_row').style.display = 'flex'
    } else {
        document.getElementById('promocode_row').style.display = 'none'
    }
}
function preparePrice(price) {
    if(price === undefined) {
        document.getElementById('race_price_row').style.display = 'none'
    } else {
        document.getElementById('race_price').innerHTML = `${data.race.price} POL <img src="/design/help.svg" onClick="Swal.fire({icon:'question',title:'What is POL',html:'POL is the cryptocurrency used on the Polygon blockchain. It is like the money you use to pay for things on the Polygon network.<p>${price} POL is about equal to ${amount}</p>'})" alt="help" />`
        document.getElementById('race_price_row').style.display = 'inline'
    }
}

function prepareStartNumber(show, data) {
    var number_display = 'none'
    if(data !== undefined 
        && data.athlete !== undefined 
        && data.athlete.bib !== undefined 
        && data.race.id !== undefined) {
        document.getElementById('start_number_text').innerHTML = data.athlete.bib
        var host = '<%= process.env.HOST_URL %>'
        document.getElementById('start_number_link').href = `${host}/image/getbib?raceId=${data.race.id}&bib=${data.athlete.bib}`
        number_display = 'inline'
    }
    if(show === SN_UPLOAD) { 
        document.getElementById('start_number_row').style.display = number_display
        document.getElementById('tracks_row').style.display = number_display
        document.getElementById('upload_row').style.display = 'flex'
        document.getElementById('upload_box').style.background = '#E5E5E5'
        document.getElementById('upload_box').innerHTML = '<h1>Upload on track</h1><p>drag file here</p><p style="text-decoration:underline">or select file from disk</p>'
    } else if(show === SN_TIMEOUT) {
        document.getElementById('start_number_row').style.display = number_display
        document.getElementById('tracks_row').style.display = number_display
        document.getElementById('upload_row').style.display = 'flex'
        document.getElementById('upload_box').style.background = '#EAF4FF'
        document.getElementById('upload_box').innerHTML = '<h1 style="color:#FF0303">Time out</h1>'
    }
    document.getElementById('stateContentContainer').style.display = show > 1 ? 'none' : 'flex'
}

function hideAll() {
    prepareAthlete(2)
    preparePromocode(false)
    preparePrice()
    prepareStartNumber(SN_TIMEOUT)
}

function showNft() {
    document.getElementById('nftDetail').style.display = 'flex'
}

function prepareScreen(data) {
    console.log("prepareScreen:", data.status)
    if(data.race.active) {
        switch (data.status) {
            case 1:
                prepareAthlete(0)
                preparePromocode(true)
                preparePrice(data.race.price)
                prepareStartNumber(SN_HIDE)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 2:
                prepareAthlete(1, data.athlete)
                preparePromocode(true)
                preparePrice(data.race.price)
                prepareStartNumber(SN_HIDE)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 3:
                prepareAthlete(1, data.athlete)
                preparePromocode(true, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_UPLOAD, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 4:
                prepareAthlete(1, data.athlete)
                preparePromocode(true, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_UPLOAD, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 5:
                prepareAthlete(1, data.athlete)
                preparePromocode(true, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_UPLOAD, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 6:
                prepareAthlete(1, data.athlete)
                preparePromocode(true, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_UPLOAD, data)
                showNft(data)
                break;
            case 10:
                hideAll()
                prepareStartNumber(SN_HIDE)
                break;
        }
    } else {
        switch (data.status) {
            case 1:
            case 2:
            case 10:
                hideAll()
                break;
            case 3:
                prepareAthlete(1, data.athlete)
                preparePromocode(true, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_TIMEOUT, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 4:
                prepareAthlete(1, data.athlete)
                preparePromocode(true, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_TIMEOUT, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 5:
                prepareAthlete(1, data.athlete)
                preparePromocode(true, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_TIMEOUT, data)
                document.getElementById('nftDetail').style.display = 'none'
                break;
            case 6:
                prepareAthlete(1, data.athlete)
                preparePromocode(true, data.race.promocode)
                preparePrice(data.race.price)
                prepareStartNumber(SN_TIMEOUT, data)
                showNft(data)
                break;
        }
    }
}