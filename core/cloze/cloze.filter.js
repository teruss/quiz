angular.
    module('core').
    filter('cloze', function() {
        var hideWord = function(word) {
            var token = '';
            for (var i = 0; i < word.length; i++) {
                if (/[a-zA-Z0-9]/.test(word[i])) {
                    token += '_';
                    continue;
                }

                token += word[i];
            }
            return token;
        };
        return function(input) {
            if (!input)
                return input;
            var question = "";
            var tokens = input.split(" ");
            for (var i = 0; i < tokens.length; i++) {
                var t = tokens[i];
                question += hideWord(t);
                if (i < tokens.length - 1) {
                    question += ' ';
                }
            }
            return question;        
        };
    });
