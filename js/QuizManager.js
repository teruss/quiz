function QuizManager() {
    this.quizBucket = function () {
        return Kii.bucketWithName("quiz");
    };

    this.createUserCard = function (quiz, userCard) {
        userCard.set("due", this.currentTicks());
        userCard.set("interval", 0);
        userCard.set("suspended", false);
        userCard.set("quiz", quiz.objectURI());
        this.updateUserCard(quiz, userCard);
        return userCard;
    };

    this.updateUserCard = function (quiz, userCard) {
        userCard.set("version", 3);
        userCard.set("kind", quiz.get("kind"));
    };

    this.createUserObject = function () {
        var userBucket = this.getUserBucket();
        return userBucket.createObject();
    };

    this.getUserBucket = function () {
        return KiiUser.getCurrentUser().bucketWithName("quiz");
    };

    this.currentTicks = function () {
        return this.ticksFromJS(new Date().getTime());
    };

    this.ticksFromJS = function (time) {
        return (time * 10000) + 621356292000000000;
    };

    this.dateFromTicks = function (ticks) {
        return new Date((ticks - 621356292000000000) / 10000);
    };

    this.saveUserCard = function (userCard) {
        console.log("saveUserCard:" + userCard);

        userCard.save({
            success: function (theObject) {
                console.log("user card was saved!");
                console.log(theObject);
                console.log("due:" + theObject.get("due"));
                console.log("quiz:" + theObject.get("quiz"));
            },
            failure: function (theObject, errorString) {
                console.log("Error saving object: " + errorString);
            }
        });
    };

    this.deleteUserCard = function (userCard) {
        console.log("deleteUserCard:" + userCard);

        // Delete the Object
        userCard.delete({
            success: function (theDeletedObject) {
                console.log("Object deleted!");
                console.log(theDeletedObject);
            },
            failure: function (theObject, errorString) {
                console.log("Error deleting object: " + errorString);
            }
        });
    };

    this.daysBetween = function (difference_ticks) {
        var one_second = 1000;
        var one_minute = one_second * 60;
        var one_hour = one_minute * 60;
        var one_day = one_hour * 24;

        var difference_ms = difference_ticks / 10 / 1000;

        var days = Math.floor(difference_ms / one_day);
        if (days > 1)
            return days + " days";
        if (days == 1)
            return days + " day";
        var hours = Math.floor(difference_ms / one_hour)
        if (hours > 1)
            return hours + " hours";
        if (hours == 1)
            return hours + " hour";
        return Math.floor(difference_ms / one_minute) + " minutes";
    };

    this.setParameters = function (quiz, obj) {
        obj.set("question", quiz.question);
        if (quiz.kind === 'free') {
            obj.set("answers", quiz.choices);
        } else if (quiz.kind === 'normal') {
            obj.set("answer", quiz.answer);
            obj.set('candidate0', quiz.dummy1);
            obj.set('candidate1', quiz.dummy2);
            obj.set('candidate2', quiz.dummy3);
        } else if (quiz.kind === 'cloze') {
            obj.set('hint', quiz.hint);
        } else {
            obj.set("answer", quiz.number);
        }
        obj.set("kind", quiz.kind);
    };

    var createChoiceQuiz = function (theObject, userCard) {
        var answer = theObject.get('answer');
        var dummy0 = theObject.get('candidate0');
        var dummy1 = theObject.get('candidate1');
        var dummy2 = theObject.get('candidate2');
        var choices = [answer, dummy0, dummy1, dummy2];
        console.assert(answer);
        if (!answer) {
            deleteQuiz(theObject);
            return null;
        }

        var uniqueNames = [];
        $.each(choices, function (i, el) {
            if (el && $.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });

        var shuffle = function () { return Math.random() - .5 };
        uniqueNames.sort(shuffle);

        return {
            'question': theObject.get("question"),
            'kind': 'normal',
            'choices': uniqueNames,
            'answer': answer,
            'object': theObject,
            'userCard': userCard,
            'dummy1': dummy0,
            'dummy2': dummy1,
            'dummy3': dummy2,
            'finished': false
        };
    };

    var createFreeQuiz = function (theObject, userCard) {
        var choices = theObject.get('answers');
        console.assert(choices, 'choices should not be null');

        var uniqueNames = [];
        $.each(choices, function (i, el) {
            if (el && $.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });

        return {
            'question': theObject.get("question"),
            'kind': 'free',
            'choices': uniqueNames,
            'object': theObject,
            'userCard': userCard,
            'finished': false
        };
    };

    var createNumberQuiz = function (theObject, userCard) {
        var answer = theObject.get('answer');
        console.assert(answer);
        if (!answer) {
            deleteQuiz(theObject);
            return null;
        }

        return {
            'question': theObject.get("question"),
            'kind': 'number',
            'number': answer,
            'object': theObject,
            'userCard': userCard,
            'finished': false
        };
    };

    this.hideWord = function (word, hidingRate) {
        var token = '';
        for (var i = 0; i < word.length; i++) {
            if (/[a-zA-Z0-9]/.test(word[i]) && (Math.random() < hidingRate)) {
                token += '_';
            } else {
                token += word[i];
            }
        }

        if (word == 'muttered') {
            var indices = [2, 3, 4];
            for (var i = 0; i < indices.length; i++) {
                if (token[indices[i]] != '_') {
                    return token;
                }
            }
            var index = indices[Math.floor(Math.random() * indices.length)];
            return token.substr(0, index) + word[index] + token.substr(index + 1);
        }

        if (word == 'Finnish') {
            var indices = [3, 4, 5, 6];
            for (var i = 0; i < indices.length; i++) {
                if (token[indices[i]] != '_') {
                    return token;
                }
            }
            var index = indices[Math.floor(Math.random() * indices.length)];
            return token.substr(0, index) + word[index] + token.substr(index + 1);
        }

        return token;
    };

    this.createClozeQuiz = function (theObject, userCard) {
        var answer = theObject.get('question');
        var hidingRate = calcHidingRate(userCard);
        var question = "";
        var tokens = answer.split(" ");
            for (var i = 0; i < tokens.length; i++) {
                var t = tokens[i];
                    question += this.hideWord(t, hidingRate);
                    if (i < tokens.length - 1) {
                        question += ' ';
                    }
            }
        return {
            'question': question,
            'answer': answer,
            'kind': 'cloze',
            'hint': theObject.get('hint'),
            'object': theObject,
            'userCard': userCard
        };
    };

    var calcHidingRate = function (userCard) {
        var numCorrect = userCard.get('numCorrectAnswers');
        numCorrect = numCorrect || 0;
        var numWrong = userCard.get('numWrongAnswers');
        numWrong = numWrong || 0;
        return calcAccuracyRate(numCorrect + 1, numWrong + 1);
    };

    var deleteQuiz = function (theObject) {
        console.error("it is not valid card");
        theObject.delete({
            success: function (theDeletedObject) {
                console.log("Object deleted!");
                console.log(theDeletedObject);
            },
            failure: function (theObject, errorString) {
                console.log("Error deleting object: " + errorString);
            }
        });
    }

    this.createQuiz = function (theObject, userCard) {
        var kind = theObject.get('kind');
        var q = this.createQuizByKind(theObject, userCard, kind);
        var numCorrect = userCard.get('numCorrectAnswers');
        if (!$.isNumeric(numCorrect))
            numCorrect = 0;
        q['numCorrectAnswers'] = numCorrect;
        var numWrong = userCard.get('numWrongAnswers');
        if (!$.isNumeric(numWrong))
            numWrong = 0;
        q['numWrongAnswers'] = numWrong;

        q['accuracyRate'] = accuracyRate(userCard);
        q['version'] = userCard.get('version');
        return q;
    }

    var accuracyRate = function (userCard) {
        var numCorrect = userCard.get('numCorrectAnswers');
        if (!$.isNumeric(numCorrect))
            return '--%';
        var numWrong = userCard.get('numWrongAnswers');
        if (!$.isNumeric(numWrong))
            return '--%';
        if (numCorrect + numWrong == 0)
            return '--%';
        return Math.round(calcAccuracyRate(numCorrect, numWrong) * 100) + '%';
    }

    var calcAccuracyRate = function (numCorrectAnswers, numWrongAnswers) {
        return numCorrectAnswers / (numCorrectAnswers + numWrongAnswers);
    }

    this.createQuizByKind = function (theObject, userCard, kind) {
        if (kind === 'normal')
            return createChoiceQuiz(theObject, userCard);
        if (kind === 'number')
            return createNumberQuiz(theObject, userCard);
        if (kind === 'cloze')
            return this.createClozeQuiz(theObject, userCard);
        return createFreeQuiz(theObject, userCard);
    }

    this.isValid = function (quiz) {
        if (!quiz)
            return false;
        if (quiz.kind === 'free') {
            if (!quiz.choices || !quiz.choices[0])
                return false;
            return true;
        }
        if (quiz.kind === 'number') {
            return $.isNumeric(quiz.number);
        }
        if (quiz.kind === 'cloze') {
            return quiz.question;
        }
        return quiz.answer && quiz.dummy1 && quiz.answer != quiz.dummy1;
    };

    this.clear = function (quiz) {
        quiz.question = '';
        quiz.answer = '';
        quiz.dummy1 = '';
        quiz.dummy2 = '';
        quiz.dummy3 = '';
        if (quiz.choices)
            for (var i = 0; i < quiz.choices.length; i++)
                quiz.choices[i] = '';
        quiz.hint = '';
    };

    this.isVisible = function (quiz) {
        return !quiz.finished && (quiz.kind === 'normal' || quiz.kind === 'free' || quiz.kind === 'number' || this.isCloze(quiz));
    };

    this.isCloze = function (quiz) {
        return quiz.kind === 'cloze';
    };

    this.wrongMessage = function (quiz) {
        if (quiz.kind === 'normal' || quiz.kind === 'cloze')
            return "Wrong! The answer is: " + quiz.answer;
        else if (quiz.kind === 'number')
            return "Wrong! The answer is: " + quiz.number;
        else
            return "Wrong! The answer is: " + quiz.choices[0];
    };

    this.isCorrect = function (quiz) {
        if (quiz.kind === 'normal' || quiz.kind === 'cloze')
            return quiz.answer === quiz.guess;
        if (quiz.kind === 'number')
            return quiz.number === quiz.guessNumber;
        return $.inArray(quiz.guess, quiz.choices) != -1;
    };

    this.setCurrentQuiz = function (quiz) {
        if (quiz.kind === 'cloze')
            quiz.question = quiz.answer;
        if (!quiz.choices)
            quiz.choices = ['', '', '', ''];
        this.currentQuiz = quiz;
    };

    this.calcInterval = function (interval, due, now, good) {
        console.assert(interval >= 0);
        if (!good)
            return 10 * 60 * 1000 * 1000 * 10;
        var delay = now - due;
        //        delay *= (1 + Math.random() / 4);
        console.assert(delay >= 0);
        return Math.max(86400 * 1000 * 1000 * 10, (interval + delay / 2) * 1.2);
    };
};
