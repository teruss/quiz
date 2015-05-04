describe('Quiz App', function() {

  it('should redirect index.html to index.html#/quizzes', function() {
    browser.get('index.html');
    browser.getLocationAbsUrl().then(function(url) {
      expect(url.split('#')[0]).toBe('/quizzes');
    });
  });
  
  describe('Quiz list view', function() {

    beforeEach(function() {
      browser.get('index.html');
    });
    
  });

  describe('Create Quiz view', function() {

    beforeEach(function() {
      browser.get('index.html#/create');
    });


    it('should display placeholder page with phoneId', function() {
//      expect(element(by.binding('phoneId')).getText()).toBe('nexus-s');
    });
  });
});
