class AnswerController{
    getHomepage(request, response){
        response.status(200).send('Hello Holberton School')
    }
}
module.exports = AnswerController