import { youdao, baidu, google } from 'translation.js'
google.translate('test').then(result => {
    console.log(result) 
})