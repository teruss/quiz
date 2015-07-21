function QuizManager() {
  this.quizBucket = function() {
    return Kii.bucketWithName("quiz");
  };

  this.createUserCard = function(theObject) {
    var userBucket = this.getUserBucket();
    var userCard = userBucket.createObject();
    userCard.set("due", this.currentTicks());
    userCard.set("interval", 0);
    userCard.set("suspended", false);
    userCard.set("quiz", theObject.objectURI());
    return userCard;
  };
  
  this.getUserBucket = function() {
    return KiiUser.getCurrentUser().bucketWithName("quiz");
  };

  this.currentTicks = function() {
    return this.ticksFromJS(new Date().getTime());
  };

  this.ticksFromJS = function(time) {
    return (time * 10000) + 621356292000000000;
  };
  
  this.dateFromTicks = function(ticks) {
    return new Date((ticks - 621356292000000000) / 10000);
  };

  this.saveUserCard = function(userCard) {
    console.log("saveUserCard:"+userCard);

    userCard.save({
      success: function(theObject) {
	console.log("user card was saved!");
	console.log(theObject);
	console.log("due:"+theObject.get("due"));
	console.log("quiz:"+theObject.get("quiz"));
      },
      failure: function(theObject, errorString) {
	console.log("Error saving object: " + errorString);
      }
    });
  };

  this.daysBetween = function(date1, date2) {
    console.log(date1);
    console.log(date2);
    var one_second = 1000;
    var one_minute = one_second * 60;
    var one_hour = one_minute * 60;
    var one_day= one_hour * 24;

    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    var difference_ms = date2_ms - date1_ms;

    var days = Math.floor(difference_ms/one_day);
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
};
