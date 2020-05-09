/*
  В index.html мы подключили файл lib.js. Он даёт вам доступ к двум библиотекам:

    esprima – http://esprima.org
    esquery – https://github.com/estools/esquery

    Они дотупны глобально и их можно использовать, чтобы проверить JS код студента.
*/

/*
  Что стоит проверить у студента:
  — есть ли вообще тег скрипт (кроме тех, что src=)
  — тег есть, но он не в <body>
  — в нем должен быть текст
  — текст в теге должен быть скриптом
  — скрипт должен исполняться
  — в скрипте, студент мог написать значение отличное от "Привет, мир" - это не ошибка, но мы предупредим
  - не будем ругать, если забыл восклицательный знак.

  в прошлом задании не использовался Babel, здесь реализовано всё через класс.
  чтобы сохранить поддержку IE11 прогоню класс через Babel
*/

"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Check = /*#__PURE__*/function () {
  function Check(document) {
    _classCallCheck(this, Check);

    this._document = document;
    this._errors = [];
    this._element = null;

    this._initializeCheck();
  }

  _createClass(Check, [{
    key: "_initializeCheck",
    value: function _initializeCheck() {
      this._checkTagInDoc();

      this._checkScript();
    }
  }, {
    key: "_checkTagInDoc",
    value: function _checkTagInDoc() {
      var jsElments = document.querySelectorAll("script:not([src])");

      if (jsElments.length === 1) {
        this._element = jsElments[0];

        if (this._element.parentElement.tagName !== 'BODY') {
          this._errors.push('Тег <script> можно использовать вне тега <body>, однако это замедляет отрисовку страниц - что в будущем отразится на скорости загрузки сайта. В будущем, старайтесь использовать тег <script> перед закрывающей конструкцией </body>');
        }

        if (this._element.innerHTML.length === 0) {
          this._errors.push('Тег <script> есть на странице, но он пуст');
        }
      } else if (jsElments.length === 0) {
        this._errors.push('Не удалось найти тег <script>. Проверьте код и попробуйте еще раз.');
      } else {
        this._errors.push('Избыточное использование конструкции <script>. Используйте её один раз.');
      }
    }
  }, {
    key: "_checkScript",
    value: function _checkScript() {
      var scriptText = this._element.innerHTML;

      try {
        var ast = esprima.parse(scriptText, {
          tolerant: true,
          loc: true,
          range: true
        });

        if (ast.errors.length > 0) {
          this._errors.push('Неверный код в конструкции <script>. Всего ошибок: ' + ast.errors.length + ". Попробуйте исправить.");

          return;
        } //поиск функции alert


        var selectorAst = esquery.parse('[callee.name=alert]');

        try {
          var matches = esquery.match(ast, selectorAst);

          if (!!matches && matches.length > 0 && !!matches[0].arguments && matches[0].arguments.length > 0) {
            var attrValue = matches[0].arguments[0].value;
            var trueValue = 'Привет, мир!';

            if (attrValue !== trueValue) {
              //скрипт правильный, вот только что-то с тектом. проверим
              var filterStr = attrValue.match(/[а-яА-Я]/gm).join('').toLowerCase();

              if (filterStr !== 'приветмир') {
                this._errors.push('В начале пути любого программиста есть фраза Привет, мир! или Hello World!. Может быть у вас опечатка? Проверьте. Успехов в программировании!');
              } // за отсутствие запятых и знаков в тексте ругать не будем =)

            }
          } else {
            this._errors.push('Ошибка синтаксического анализа элемента <script>');
          }
        } catch (e) {
          this._errors.push('Ошибка синтаксического анализа: ' + e.message + '. Обратите внимание на код элемента <script>');
        }
      } catch (e) {
        this._errors.push('Ошибка синтаксического анализа: ' + e.message + '. Обратите внимание на код элемента <script>');

        return;
      }
    }
  }, {
    key: "getErrors",
    value: function getErrors() {
      return this._errors;
    }
  }]);

  return Check;
}();

const checker 	= new Check(document);
const errors 	= checker.getErrors();

console.log(errors);