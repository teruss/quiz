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
    return (time * 10000) + 621355968000000000;
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
}
