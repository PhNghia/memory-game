import datas from './imgDatas.js'
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// common state game
// have 3 version name is Game, My bears and Idol 18+
let versionNameInModalItem = 'game'
// step version is step by step of version name 

let backgrounds = {
    'game': 'game',
    'my bears': 'bears',
    'idol 18+': 'idol'
}
let versionImgSrcDatas = datas['game']
// have 3 version background is game, bears and idol
let versionBackgroundTag = 'game'
// to test one round is completed? if didn't completed, not play more
let isCompleteOneRound = true;
// to test tag has open completed? if no didn't completed, can not open anymore new tag
let isCompleteOpen = true;
// to control level and render number tags 
let levelGame = 0
let isTurn = 0 // 2 tag open is 1 turn 
let currentTypeLevel = 'easy'
let timeWait = 100 // this variable is time to wait for the logic execute
                   // and it is time to transition in style.css file at tag node has class ".tag"
                   // and at tag "img" inside ".tag"
// play button animation 
;(() => {
    const homeStartElement = $('.start__button-container')
    const startButtonHoverElement = $('.start__button-hover')

    startButtonHoverElement.onmouseover = () => {
            homeStartElement.classList.add('activeHover')
    }

    startButtonHoverElement.onmouseout = () => {
        homeStartElement.classList.remove('activeHover')
    }
})()

// LOGIC GAME

// window.onload then when user click play button we started game
window.onload = () => {
    const startButtonHoverElement = $('.start__button-hover')
    if (startButtonHoverElement) {
        startButtonHoverElement.onclick = () => {
            // this condition is trick to use function only 1 time and then it's can work anymore
            if (!startButtonHoverElement.matches('.soldOut')) {
                handlerRenderPagePlaying()
                startGame()
                startButtonHoverElement.classList.add('soldOut')
            }   
        }
    }
}

// when start playing this playing page is render to play
function handlerRenderPagePlaying () {
    const titleGame = $('.title__game')
    const homePage = $('#home')
    const playingPage = $('#playing')

    // close home page
    homePage.classList.toggle('active')
    // convert to playing page
    playingPage.classList.toggle('active')
    // turn off/ on title game memory
    if (playingPage.matches('.active')) {
        titleGame.style.display = 'none'
    } else {
        titleGame.style.display = 'block'
    }
}

// Start game
function startGame() {
    countLevel()
    handlerInfoGame()
    let listImage = handlerDataByTypeLevel(versionImgSrcDatas)
    let newListImage = handlerDataByLevel(listImage)
    let newList = randomLocalListImage(newListImage)
    createAndRenderTags(newList)
    changeSizeTag()
    playGame()
}

function createAndRenderTags (listImage) {
    const localGamePlay = $('.localGame__play')

    localGamePlay.innerHTML = listImage.map(itemImage => {
        return `
            <div class="tag">
                <img src="./assets/image/${itemImage}.png" alt="">
                <div class="tag__background tag__background--${versionBackgroundTag} close"></div>
            </div>
        `
    })
    .join('')
}

function randomLocalListImage (list) {
    let newList = []
    
    while (list.length > 0) {
        let randomIndex = Math.floor(Math.random() * list.length)
        newList.push(list[randomIndex])
        list.splice(randomIndex, 1)
    }
    
    return newList
}

// have a source value img src from user choose to handle 
function handlerDataByTypeLevel (versionImgDatas) {
    // versionImgDatas hold total img value
    // depend on type level 'easy', 'medium' or 'hard'
    // to get amount img value 
    // and here i devide that: 
    // easy: 1/3 length; medium: 2/3 length; hard: 3/3 = 1 length
    const scoreTypeLevel = {
        easy: 1/3,
        medium: 2/3,
        hard: 1
    }

    const listGame = []
    let amountImgGame = versionImgDatas.length * scoreTypeLevel[currentTypeLevel]
    for (let i = 0; i < amountImgGame; i++) {
        if (!listGame.includes(versionImgDatas[i])) 
            listGame.push(versionImgDatas[i])
    }
    return listGame
}

function handlerDataByLevel (imgDatas) {
    let newDatas = [...imgDatas]
    let storeSrc = []
    const listImage = []
    let n = 1

    if (levelGame == 5) {
        n = 60
    } else {
        for (let i = 0; i < (levelGame + 1); i++) 
        n *= 2
    }

    for (let i = 0; i < (n / 2); i++) {
        let random = Math.floor(Math.random() * newDatas.length)
        listImage.push(newDatas[random])
        listImage.push(newDatas[random])
        storeSrc.push(newDatas[random])
        newDatas.splice(random, 1)
        if (newDatas.length == 0) {
            newDatas = storeSrc
            storeSrc = []
        }
    }

    return listImage
}

function playGame () {
    const tags = $$('.tag')
    const countTurn = makeTurn()
    // this variable use test is click tag has open but not completed? 
    let tagBefore = undefined

    // when change version and has open 1 tag then isTurn global has value 1,
    // so if open 1 new tag in new version it's make isTurn is 2 
    // and can't click anymore because 2 tag isCompleteOneRound is false and it's not change true forever
    // so need reset isTurn when change version
    isTurn = 0

    Array.from(tags).forEach(tag => {
        tag.onclick = () => {
            // tag valid which is tag has img element (it's mean tag exist)
            let tagValid = tag.querySelector('img')
            
            // execute need wait logic before 
            // one round need completed to next round
            if (isCompleteOneRound) {
                // tag is completed open full to can open tag next (it's mean can click again)
                if (isCompleteOpen && tagValid && tagBefore != tag) {
                    let isTagClose = handlerBackground(tag)
                    isCompleteOpen = false
                    isTurn += 1
                    tagBefore = tag
                    setTimeout(() => {
                        isCompleteOpen = true;
                    }, timeWait)
                    if (isTurn == 2) {
                        isCompleteOneRound = false
                        tagBefore = undefined
                        countTurn()
                    }
                    handlerAnimationOpen(tag)
                    // if tag close (mean has background), tag will open when click and feedback
                    if (isTagClose) {
                        setTimeout(handlerCompareTags, timeWait)
                    }
                }
            }
        }
    })
}

// this function was used when tag is close mean has background to cover
function handlerBackground (tag) {
    // select tag background element had been clicked 
    const tagBackground = tag.querySelector('.tag__background')
    // test is it has class value 'close' (mean it will open when clicked)
    const isBackground = tagBackground.matches('.close')

    if(isBackground) {
        // remove class close it's mean open tag to see image
        setTimeout(() => {
            tagBackground.classList.remove('close')
        }, timeWait / 2)
    }
    
    return isBackground
}

// function handler animation when open tag (remove background)
function handlerAnimationOpen (tag) {
    tag.style.transform = 'rotateY(180deg)'
}

// function handler animation when close tags different other (it's mean cover again background)
function handlerAnimationClose (tags) {
    tags.forEach(tag => {
        tag.style.transform = 'rotateY(0deg)'
    })
}

function handlerCompareTags () {
    // select all tag has open (class 'close' had removed it's mean background not exist)
    const tagsOpen = getTagOpenValid()

    if (tagsOpen) {
        // get src img to compare
        let tagsOpenValueImage = tagsOpen.map(tag => {
            return tag.querySelector('img').src
        })
        // test two src img has similar
        let isSimilar = compareTwoTagsValueImage(tagsOpenValueImage)

        if (isSimilar) {
            tagsOpen.forEach(tag => {
                tag.querySelector('img').style.opacity = '0'
                setTimeout(() => {
                    tag.querySelector('img').remove()
                    isCompleteOneRound = true
                    isTurn = 0
                    if ($$('.tag__background').length == $$('.completed').length) {
                        handlerCompleteGame()
                    }
                }, timeWait)
                tag.querySelector('.tag__background').classList.add('completed')
            })
        } else {
            // if different when need stop time time s to view deep tags
            let timeStop = 350
            setTimeout(() => {
                handlerAnimationClose(tagsOpen)
                setTimeout(() => {
                    isCompleteOneRound = true
                    isTurn = 0
                }, timeWait)
                setTimeout(() => {
                    tagsOpen.forEach(tag => {
                        tag.querySelector('.tag__background').classList.add('close')
                    })
                }, timeWait / 2)
            }, timeStop)
        }
    }
}

function getTagOpenValid () {
    // select all tag background has on browser
    const tagsBackground = $$('.tag__background')
    // new store to push tag has open (background not exist)
    const tagsOpenValid = []

    Array.from(tagsBackground).forEach((tagBackground) => {
        // select tag don't have class "close" (it's mean open) and tag valid
        if ((!tagBackground.matches('.close')) && (!tagBackground.matches('.completed'))) {
            tagsOpenValid.push(tagBackground.parentElement)
        }
    })

    // just two tags to compare together
    if (tagsOpenValid.length == 2) {
        // give store contain tag element has contain img element
        return tagsOpenValid
    }
}

function compareTwoTagsValueImage (data) {
    if (data[0] == data[1]) {
        return true
    }

    return false
}

// handler information game like time, round, score
function countLevel () {
    levelGame += 1
    if (levelGame >= 6) {
        levelGame = 6
    }
    return levelGame
}

// every tag has completed is complete game
function handlerCompleteGame () {
    if (levelGame == 6) {
        alert("CONGRATULATIONS! YOU HAVE SUCCESS FINISHED FULL MEMORY GAME!")
    }
    alert("Game finishes? Next game?")
    startGame()
}

// handler information to render browser and lie inside class "infoGame"
function handlerInfoGame () {
    const infoGameElement = $('.infoGame')
    handlerRenderTitleGame(infoGameElement)
    handlerRenderLevel(infoGameElement)
    handlerRenderTurn(infoGameElement)
    handlerRenderTypeLevel(infoGameElement)
    handlerRenderVersion(infoGameElement)
    handlerGetOut(infoGameElement)
}

function handlerRenderTitleGame (contain) {
    const srcTitleGameImage = 'titleGame'
    // remove all title game element before
    const titleGames = $$('.infoGame__title')
    if (titleGames) {
        Array.from(titleGames).forEach(titleGame => {
            titleGame.remove()
        })
    }

    // create new title game to render infoGame
    const div = document.createElement('div')
    div.setAttribute('class', 'infoGame__title')
    div.innerHTML = `
        <img class="infoGame__title-img" src="./assets/image/${srcTitleGameImage}.png">
    `
    contain.append(div)

    // style div and img title game
    const imgTitle = $('.infoGame__title-img')
    imgTitle.style.width = '28rem'
    imgTitle.style.marginTop = '2.5rem'
}

function handlerRenderLevel (contain) {
    // select all h1 element talk level before and remove them to render new level
    const h1Elements = $$('.infoGame h1')
    if (h1Elements) {
        Array.from(h1Elements).forEach(h1Element => {
            h1Element.remove()
        })
    }
    
    // create h1 element to render level now
    const h1 = document.createElement('h1')
    h1.setAttribute('class', 'infoGame__level')
    h1.innerText = `Level: ${levelGame}`
    contain.append(h1)
}

function handlerRenderTurn (contain) {
    const h1 = document.createElement('h1')
    h1.setAttribute('class', 'infoGame__turn')
    h1.innerText = `Turn: 0`
    contain.append(h1)
}

function handlerRenderTypeLevel (contain) {
    // remove all select element before
    const hasSelect = $$('.infoGame__type-level')
    if (hasSelect) {
        hasSelect.forEach(select => {
            select.remove()
        })
    }
    // add select element
    const select = document.createElement('select')
    select.setAttribute('class', 'infoGame__type-level')
    select.innerHTML = `
        <option value="easy">type level: easy</option>
        <option value="medium">type level: medium</option>
        <option value="hard">type level: hard</option>
    `
    select.value = currentTypeLevel
    contain.append(select)

    const typeLevelElement = $('.infoGame__type-level')
    typeLevelElement.oninput = () => {
        const isChangeTypeLevel = confirm('Are you sure change type level?')
        if (!isChangeTypeLevel) {
            typeLevelElement.value = currentTypeLevel
            return
        }
        changeTypeLevel(typeLevelElement)
    }
}

function changeTypeLevel (contain) {
    currentTypeLevel = contain.value
    levelGame--
    startGame()
}

function makeTurn () {
    let turn = 0

    return function () {
        turn += 1
        UpdateTurnInBrowser(turn)
    }
}

function UpdateTurnInBrowser (turn) {
    const h1TurnElement = $('.infoGame').querySelector('.infoGame__turn')
    h1TurnElement.innerText = `Turn: ${turn}`
}

// change size tag for step level 
function changeSizeTag () {
    let localGamePlay = $('.localGame__play')
    let tagElements = $$('.tag')
    let widthTagParent
    let heightTagParent
    let widthTag
    let heightTag
    let marginLeft = 1
    let marginTop = 1

    switch (levelGame) {
        case 1:
            widthTagParent = 49
            marginLeft = 4
            marginTop = 4
            widthTag = 20
            heightTag = 27
            break
        case 2:
            widthTagParent = 95
            marginLeft = 3.4
            marginTop = 4
            widthTag = 20
            heightTag = 27
            break
        case 3:
            widthTagParent = 54
            marginLeft = 1.4
            marginTop = 1.15
            widthTag = 12
            heightTag = 15
            break
        case 4: 
            widthTag = 11
            heightTag = 15.2
            break
        case 5:
            widthTag = 7
            heightTag = 12
            break
        default:
            widthTag = 5
            heightTag = 7.1
    }

    switch (levelGame) {
        case 1:
        case 2:
        case 3:
            heightTagParent = 32
            break
        default:
            widthTagParent = 97
            heightTagParent = 64
    }

    Array.from(tagElements).forEach(tagElement => {
        localGamePlay.style.height = `${heightTagParent}rem`
        localGamePlay.style.maxWidth = `${widthTagParent}rem`
        tagElement.style.width = `${widthTag}rem`
        tagElement.style.height = `${heightTag}rem`
        tagElement.style.marginTop = `${marginTop}rem`
        tagElement.style.marginLeft = `${marginLeft}rem`
        tagElement.querySelector('img').style.width = `${widthTag - 1.4}rem`
    })
}

function handlerRenderVersion (contain) {
    // remove all button change before
    const buttonChanges = contain.querySelectorAll('.infoGame__change-version')
    if (buttonChanges) {
        Array.from(buttonChanges).forEach(buttonChange => {
            buttonChange.remove()
        })
    }

    // create new change version button
    const button = document.createElement('button')
    button.setAttribute('class', 'infoGame__change-version')
    button.innerText = `Change Version`
    contain.append(button)

    button.onclick = handlerModal
}

function changeVersion (versionName) {
    // replace all img has exist in browser now 
    // select all img element in browser now (not imgs had removed)
    const tagsImage = $('.localGame__play').querySelectorAll('img')
    // loop one by one img to replace src to change version
    Array.from(tagsImage).forEach(tagImage => {
        let srcImg = tagImage.src
        // handler to get value src similar with datas value array
        // 1. get srcLast 
        let srcLast = srcImg.slice(srcImg.indexOf('image/') + 6)
        // 2. find index srcLast in datas with key is versionNameInModalItem (old name)
        let index = datas[versionNameInModalItem].indexOf(srcLast.slice(0, srcLast.indexOf('.png')))
        // 3. replace old srcLast has index similar with new srcLast with key is versionName (new name)
        srcLast = datas[versionName][index]
        // 4. update new version img 
        tagImage.src = `./assets/image/${srcLast}.png`
    }) 

    // change version background
    // 1. select background element in tag
    const tagsBackground = $('.localGame__play').querySelectorAll('.tag__background')
    // 2. loop step tagBackgrond
    Array.from(tagsBackground).forEach(tagBackgrond => {
        // get value of attribute class
        const valueAttribue = tagBackgrond.getAttribute('class')
        // replace value tag__background--${versionBackgroundTag} to tag__background--${backgrounds[versionName]}
        // versionBackgroundTag is variable contain old background
        // backgrounds[versionName] is contain new background
        const newValueAttribute = valueAttribue.replace(versionBackgroundTag, backgrounds[versionName])
        // update new background
        tagBackgrond.setAttribute('class', newValueAttribute)
    })

    // change versionNameInModalItem is change name (the key of datas object)
    versionNameInModalItem = versionName
    // change version to startGame() has render new version has checked
    versionImgSrcDatas = datas[versionName]
    //  change version background with variable is versionBackgroundTag
    versionBackgroundTag = backgrounds[versionName]
}

// handler change Version with many thing
// like click change verson button to open modal
// choose version and click ok to close and execute version

// handler open, close modal when change button on click
function handlerModal () {
    const modal = $('.modal')
    const closeButton = $('.closeButton')
    const buttonModal = modal.querySelector('.modal__button-agree')
    

    // open or close modal
    modal.classList.toggle('open')
    // after this statement in head, modal had opened or closed

    if (modal.matches('.open')) {
        // render versions
        renderVersionToChose(modal)
        // when click chose version
        handlerChoseVersion(modal)

        // toggle border and font color
        let toggleTitle = setInterval(() => {
            modal.querySelector('.modal__title').classList.toggle('toggle')
        }, 500)

        // hander when button agree on click 
        buttonModal.onclick = (e) => {
            // call function to execute change version and startGame()
            handlerButtonModalToChangeVersion(e, modal, toggleTitle)
        }
        closeButton.onclick = () => {
            clearInterval(toggleTitle)
            handlerModal()
        }
    }
}

// handler when chose version game in modal
function handlerChoseVersion(modal) {
    const versionChoses = modal.querySelectorAll('.modal__item')

    modal.onclick = () => {
        Array.from(versionChoses).forEach(versionChose => {
            versionChose.classList.remove('checked')
        })
    }

    Array.from(versionChoses).forEach(versionChose => {
        versionChose.onclick = (e) => {
            if ($('.modal__item.checked')) {
                $('.modal__item.checked').classList.remove('checked');
            }
            versionChose.classList.add('checked')
            e.stopPropagation();
        }
    })
}

// execute when button on modal is clicked
function handlerButtonModalToChangeVersion (e, modal, toggleTitle) {
    // stop propagation cancel checked version
    e.stopPropagation();

    // change version in browser
    const versionChecked = modal.querySelector('.modal__item.checked')
    if (versionChecked) {
        // anouncement change succes
        alert('Change Succes')
        // stop toggle title
        clearInterval(toggleTitle)
        // close modal
        handlerModal()
        // change version has checked
        const versionName = versionChecked.querySelector('.modal__version-name').innerText.toLowerCase()
        // versionName is name bottom image in modal item
        changeVersion(versionName)
    } 
    else if (!versionChecked) {
        // not chose any version
        alert(`If you don't want change version, you can close this log by close button on top.`)
    }
}

// render to modal some version to chose
function renderVersionToChose (modal) {
    const versionRepresents = ['sun', 'albedo', 'yuaMikami']
    const nameVersions = ['game', 'my bears', 'idol 18+']

    // select moda__list element to render version
    modal.querySelector('.modal__list').innerHTML = 
        versionRepresents.map((version, index) => {
            return `
                <div class="modal__item">
                    <img src="./assets/image/${version}.png" alt="">
                    <h3 class="modal__version-name">${nameVersions[index]}</h3>
                </div>
            `
        }).join('')

    // chose default version is checking
    const modalVersionNames = modal.querySelectorAll('.modal__version-name')
    Array.from(modalVersionNames).forEach(version => {
        if (version.innerText.toLowerCase() == versionNameInModalItem) {
            version.parentElement.classList.add('checked')
        }
    })
}

// come out playing game (it's mean render title Game and button start game)
function handlerGetOut (contain) {
    // remove all button get out before
    const buttonsGetOut = contain.querySelectorAll('.infoGame__getout')
    if (buttonsGetOut) {
        Array.from(buttonsGetOut).forEach(button => {
            button.remove()
        })
    }

    // create new button get out
    const button = document.createElement('button')
    button.setAttribute('class', 'infoGame__getout')
    button.innerText = 'Exit'
    contain.append(button)

    button.onclick = () => {
        // test again exit ok
        const isExit = confirm('Are you sure exit game now?')
        if (isExit) {
            // get out game
            handlerRenderPagePlaying()
            // comeback game again when click start button game
            comebackGame()
        }
    }   
}

// get out game
function comebackGame () {
    const buttonStartGame = $('.start__button-hover.soldOut')
    buttonStartGame.onclick = () => {
        // render playing game and close home page
        handlerRenderPagePlaying()
        // test user have want continue game before
        const isContinueGameBefore = confirm('Do you want to continue game before?')
        // if continue, needn't reset all prototype
        // if not, need reset all prototype
        if (!isContinueGameBefore) {
        // reset all prototype of game
            // version name default
            versionNameInModalItem = 'game'
            // value version is get by key version name 
            versionImgSrcDatas = datas[versionNameInModalItem]
            // have 3 version background is game, bears and idol
            versionBackgroundTag = 'game'
            // to test one round is completed? if didn't completed, not play more
            isCompleteOneRound = true;
            // to test tag has open completed? if no didn't completed, can not open anymore new tag
            isCompleteOpen = true;
            // to control level and render number tags 
            levelGame = 0
            isTurn = 0 // 2 tag open is 1 turn 
            // type level default is easy
            currentTypeLevel = 'easy'
        // start new game
            startGame()
        }
    }
}