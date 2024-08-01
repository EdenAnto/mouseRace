// Define a parent class of element with common features
class Element {
    constructor() {
        if (new.target === Element)
            throw new Error("Cannot instantiate an abstract class.");
        this.htmlEl = undefined;
        this.active=true;
    }
    onClickElement(){
        this.active=false;
        new Game()
    }

}
//Abstract class of shape
class Shape {
    constructor(pix){
        if (new.target === Element)
            throw new Error("Cannot instantiate an abstract class.");
        this.minSize= 0.03*pix;
        this.maxSize= 0.07*pix;
    }
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } 
}

//define derives classes of Shape, position set size randomly 
class Rect extends Shape{
    constructor(pix) {
        super(pix)
    this.width = this.getRandomInt(this.minSize, this.maxSize);
    do {
        this.height = this.getRandomInt(this.minSize, this.maxSize);
    } while (this.width == this.height)
    }
}
class Circle extends Shape{
    constructor(pix) {
        super(pix)
    this.diameter = this.getRandomInt(this.minSize, this.maxSize);
    }
}
class Sqaure extends Shape{
    constructor(pix) {
        super(pix)
        this.width = this.getRandomInt(this.minSize, this.maxSize);
    }
}
// Define a derived class of Element
class CollectEl extends Element {
    constructor(boardRect,boardId,pix) {
        super();
        this.shape = new Rect(pix);
        this.widthFactor = boardRect.width - this.shape.width;
        this.heightFactor = boardRect.height - this.shape.height;
        this.minHeight = boardRect.bottom-boardRect.top- this.shape.height;
        this.initialTop=this.shape.getRandomInt(0, this.minHeight) + 'px'
        this.createEl(boardId);
    }
    createEl(boardId){
         this.htmlEl = $('<div>', {
            class: 'collectEl element',
        }).css({
            left: Math.random() * this.widthFactor + 'px',
            top: this.initialTop,
            width: this.shape.width + 'px',
            height: this.shape.height + 'px'
        })
        this.htmlEl.on('click', ()=>this.onClickElement(this));

        this.htmlEl.appendTo(`#${boardId}`);
    }
    
    onClickElement(el){
        super.onClickElement();
        el.htmlEl.remove();

    }
}

class AvoidEl extends Element {
    constructor(boardRect,boardId,pix) {
        super();
        this.shape = new Circle(pix)
        this.widthFactor = boardRect.width - this.shape.diameter;
        this.heightFactor = boardRect.height - this.shape.diameter;
        this.minHeight = boardRect.bottom-boardRect.top- this.shape.diameter;
        this.initialTop=this.shape.getRandomInt(0, this.minHeight) + 'px'
        this.createEl(boardId);
    }

    createEl(boardId){
        this.htmlEl = $('<div>', {
                class: 'avoidEl element',
            }).css({
                left: Math.random() * this.widthFactor + 'px',
                top: this.initialTop,
                width: this.shape.diameter + 'px',
                height: this.shape.diameter + 'px'
            });
            this.htmlEl.on('click', ()=>this.onClickElement(this));

        this.htmlEl.appendTo(`#${boardId}`);
        }
}

class ChangeEl extends Element {
    constructor(boardRect,boardId,pix) {
        super();
        this.color= Math.round(Math.random()) ? 'green' :  'red';
        this.shape = new Sqaure(pix);
        this.widthFactor = boardRect.width - this.shape.width;
        this.minHeight = boardRect.bottom-boardRect.top- this.shape.width;
        this.initialTop=this.shape.getRandomInt(0, this.minHeight) + 'px'
        this.createEl(boardId);
    }
    createEl(boardId){
        this.htmlEl = $('<div>', {
                class: 'changeEl element',
            }).css({
                left: Math.random() * this.widthFactor + 'px',
                top: this.initialTop,
                width: this.shape.width + 'px',
                height: this.shape.width + 'px',
                backgroundColor: this.color
            });
            this.htmlEl.on('click', ()=>this.onClickElement(this));

        this.htmlEl.appendTo(`#${boardId}`);
        }

        //overide of parent function
        onClickElement(){
            super.onClickElement()
            if (this.active==false)
                this.htmlEl.remove();
            else{
                this.htmlEl.on('click', ()=>{});
            }
        }
}

// The timer class has control the timer on the screen and the element route
// This class implemented as Singleon 
class Timer{
    #timerDiv;#seconds;#minutes;#secondsMod6;#secondsMod3;#secondsMod2;#on;
    constructor(divId,speed){
        if (Timer.instance) {
            return Timer.instance
        }
        this.#timerDiv = $(`#${divId}`);
        this.#seconds=0;
        this.#minutes = 0;
        this.#secondsMod6,this.secondsMod3,this.secondsMod2;
        this.#on = true
        this.avoidElSpeed = speed
        this.collectElSpeed = speed
    }
    run() {
        this.interval = setInterval(() => {
            if (this.#on) {
                this.#seconds++;
                if (this.#seconds === 60) {
                    this.#seconds = 0;
                    this.#minutes++;
                }
                this.#timerDiv.text(`${this.padZero(this.#minutes)}:${this.padZero(this.#seconds)}`);

                this.secondsMod2 = this.#seconds % 2;
                this.secondsMod3 = this.#seconds % 3;
                this.secondsMod6 = this.#seconds % 6;
                if (this.secondsMod6 === 0) {
                    this.avoidElSpeed *= -1;
                    this.collectElSpeed *= -1;
                } else if (this.#seconds % 2 === 0) {
                    this.collectElSpeed *= -1;
                } else if (this.#seconds % 3 === 0) {
                    this.avoidElSpeed *= -1;
                }
            }
        }, 1000);
    }

    stop() {
        this.on = false;
        clearInterval(this.interval); // Clear the interval to stop the timer
    }

    //zero padding for timer elemnt on secrren for display (usecase: e.g. 01:02)
    padZero(num) {
        return num < 10 ? '0' + num : num;
    }
}

// The main class that perform the game. contains all elemnts and control their movment
// This class implemented as Singleon which asjuster to my needs.
class Game {
    #boardId;
    #numOfElements;
    #numOfCollects;
    #numOfAvoids;
    #numOfChanges;
    #boardRect;
    #points;
    #pointsToWin;
    #timer;

    constructor(boardId, boardRect, numOfElements, collectsPercents, avoidPercents, timerDivName, speed, pixRef) {
        if (Game.instance) {
            Game.instance.elements = Game.instance.elements.filter(el => {
                if (!el.active) {
                    let color = el.htmlEl.css('backgroundColor');
                    let red = 'rgb(255, 0, 0)';
                    if (color === red) {
                        Game.instance.#stop(el);
                    }
                    Game.instance.#points++;
                    console.log(Game.instance)
                    Game.instance.#checkWin();
                    return false; // Remove inactive elements
                }
                return true; // Keep active elements
            });
            return Game.instance;
        }

        this.#boardId = boardId;
        this.#numOfElements = numOfElements;
        this.#numOfCollects = Math.round(0.01 * collectsPercents * numOfElements);
        this.#numOfAvoids = Math.round(0.01 * avoidPercents * numOfElements);
        this.#numOfChanges = numOfElements - this.#numOfCollects - this.#numOfAvoids;
        this.#boardRect = boardRect;
        this.#createElements(pixRef);
        this.#points = 0;
        this.#pointsToWin = numOfElements - this.#numOfAvoids;
        this.#timer = new Timer(timerDivName, speed);
        Game.instance = this;
    }

    #createElements(pixRef) {
        this.elements = [];
        for (let i = 0; i < Math.max(this.#numOfCollects, this.#numOfAvoids); i++) {
            if (i < this.#numOfCollects)
                this.elements.push(new CollectEl(this.#boardRect, this.#boardId, pixRef));
            if (i < this.#numOfAvoids)
                this.elements.push(new AvoidEl(this.#boardRect, this.#boardId, pixRef));
            if (i < this.#numOfChanges)
                this.elements.push(new ChangeEl(this.#boardRect, this.#boardId, pixRef));
        }
    }

    start() {
        const self = this;
        self.#timer.run();

        function nextStepFunc() {
            $('.collectEl').each(function(index, element) {
                let $el = $(element);
                let positionY = parseFloat($el.css('top'));
                positionY += self.#timer.collectElSpeed;
                if (positionY > self.#boardRect.bottom - self.#boardRect.top - $el.height())
                    positionY = 0;
                else if (positionY < 0)
                    positionY = self.#boardRect.bottom - self.#boardRect.top - $el.height();

                $el.css({ top: positionY + 'px' });
            });

            $('.avoidEl').each(function(index, element) {
                let $el = $(element);
                let positionX = parseFloat($el.css('left'));

                positionX += self.#timer.avoidElSpeed;
                if (positionX > self.#boardRect.width - $el.width())
                    positionX = 0;
                else if (positionX < 0)
                    positionX = self.#boardRect.width - $el.width();

                $el.css({ left: positionX + 'px' });
            });
        }

        this.nextStep = setInterval(nextStepFunc, 10);
        this.changeColor = setInterval(() => {
            $('.changeEl').each(function(index, element) {
                let $el = $(element);
                let color = $el.css('backgroundColor');
                let red = 'rgb(255, 0, 0)';
                let green = 'rgb(0, 128, 0)';
                let newColor = (color === red) ? green : red;
                $el.css({ backgroundColor: newColor });
            });
        }, 4000);
    }

    #stop(el) {
        this.#timer.stop();
        $('.element').remove();

        el.htmlEl.appendTo(`#${this.#boardId}`);
        el.htmlEl.css({ animation: 'growShrink 2s infinite' });
        el.active = true;
        clearInterval(this.changeColor);
        clearInterval(this.nextStep);
        $(`#${this.#boardId}`).after('<h1 id="result">You Lost! Click To Start New Game</h1>');
        $('#result').on('click', () => window.location.href = '/');
    }

    #checkWin() {
        console.log("inside")
        let $board = $(`#${this.#boardId}`);
        if (this.#points !== this.#pointsToWin)
            return false;

        this.#timer.stop();
        $('.element').remove();
        $board.after('<h1 id="result">Win!</h1>');

        const form = $('<form>', { id: 'resultForm' });
        const title = $('<h3>').text('Enter Your Result:');
        const nameLabel = $('<label>', { for: 'name' }).text('Name:');
        const nameInput = $('<input>', {
            type: 'text', id: 'name', name: 'name',
            pattern: '^[A-Za-zא-ת]+$', title: 'Format: Name start with letter'
        });
        const timeLabel = $('<label>', { for: 'time' }).text('Time Elapsed:');
        const timeInput = $('<input>', {
            type: 'text', id: 'time', name: 'time',
            pattern: '\\d{2}:\\d{2}', title: 'Format: xx:xx (e.g., 00:15)',
            disabled: true, value: $('#timer').text()
        });
        const submitButton = $('<button>', { type: 'submit' }).text('Submit');

        form.append(title, nameLabel, nameInput, $('<br>'));
        form.append(timeLabel, timeInput, $('<br>'));
        form.append(submitButton);
        $board.append(form);

        $('#resultForm').on('submit', function(event) {
            event.preventDefault();
            const name = $('#name').val();
            const time = $('#time').val();

            fetch('/insertDB', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, score: time })
            })
            .then(function(response) {
                if (response.ok) {
                    window.location.href = '/leaderboard';
                } else {
                    console.error('Failed to submit score');
                }
            })
            .catch(function(error) {
                window.location.href = '/leaderboard?message=connectionError';
                console.error('Error:', error);
            });
        });
    }
}

// module.exports = { Game };
