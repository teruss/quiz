function QuizManager() {
    this.quizBucket = function () {
        return Kii.bucketWithName("quiz");
    };

    this.createUserCard = function (theObject) {
        var userBucket = this.getUserBucket();
        var userCard = userBucket.createObject();
        userCard.set("due", this.currentTicks());
        userCard.set("interval", 0);
        userCard.set("suspended", false);
        userCard.set("quiz", theObject.objectURI());
        return userCard;
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

    this.daysBetween = function (date1, date2) {
        console.log(date1);
        console.log(date2);
        var one_second = 1000;
        var one_minute = one_second * 60;
        var one_hour = one_minute * 60;
        var one_day = one_hour * 24;

        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = date2_ms - date1_ms;

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

    var createClozeQuiz = function (theObject, userCard) {
        var answer = theObject.get('question');
        var hidingRate = calcHidingRate(userCard);
        var question = "";
        for (var i = 0; i < answer.length; i++) {
            if (/[a-zA-Z0-9]/.test(answer[i]) && Math.random() < hidingRate) {
                question += '_';
            } else {
                question += answer[i];
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
        if (!$.isNumeric(numCorrect))
            return 0.5;
        var numWrong = userCard.get('numWrongAnswers');
        if (!$.isNumeric(numWrong))
            return 0.5;
        if (numCorrect + numWrong == 0)
            return 0.5;
        return calcAccuracyRate(numCorrect, numWrong);
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
        var q = createQuizByKind(theObject, userCard, kind);
        var numCorrect = userCard.get('numCorrectAnswers');
        if (!$.isNumeric(numCorrect))
            numCorrect = 0;
        q['numCorrectAnswers'] = numCorrect;
        var numWrong = userCard.get('numWrongAnswers');
        if (!$.isNumeric(numWrong))
            numWrong = 0;
        q['numWrongAnswers'] = numWrong;

        q['accuracyRate'] = accuracyRate(userCard);
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
        return calcAccuracyRate(numCorrect, numWrong) * 100 + '%';
    }

    var calcAccuracyRate = function (numCorrectAnswers, numWrongAnswers) {
        return numCorrectAnswers / (numCorrectAnswers + numWrongAnswers);
    }

    var createQuizByKind = function (theObject, userCard, kind) {
        if (kind === 'normal')
            return createChoiceQuiz(theObject, userCard);
        if (kind === 'number')
            return createNumberQuiz(theObject, userCard);
        if (kind === 'cloze')
            return createClozeQuiz(theObject, userCard);
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
        return !quiz.finished && (quiz.kind === 'normal' || quiz.kind === 'free' || quiz.kind === 'number' || quiz.kind === 'cloze');
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
        this.currentQuiz = quiz;
    };
};
