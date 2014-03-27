
// form elements
$(function(){
  $('body').on('change', 'form input[type=file]', function(event) {
    var $fileInput = $(this),
      $formGroup = $(this).parents('.form-group'),
      $hiddenInput = $(event.target).next('input[type=hidden]');
    if (event.target.files && event.target.files.length) {
      var fileReader = new FileReader();
      fileReader.onload = function(e) {
        $hiddenInput.val(e.target.result);
        if ($formGroup.data('image-preview')) {
          var $container = $formGroup
            .find($formGroup.data('image-preview')),
            $img = $('<img>');
          $img.attr('src', e.target.result);
          $container
            .empty()
            .append($img);
        }
      };
      fileReader.readAsDataURL(event.target.files[0]);
    }
  });


  // init bootpag
  if (window['_paginationPages']) {
    $('#page_selection').bootpag({
      total: window._paginationPages || 1,
      page: 1,
      maxVisible: 10
    }).on('page', function(event, num){
      $.get(location.href, {page: num}, function(data) {
        $('#content').html(data);
        $('#search_input input').val('');
      });
    });
    var $searchInput = $('<input type="text" name="search" placeholder="Suchen nach..." class="form-control"></div>'),
      $searchInputWrapper = $('<div id="search_input"></div>'),
      searchEvent;
    $searchInput.on('keyup', function(event) {
      clearTimeout(searchEvent);
      searchEvent = setTimeout(function(){
        var searchParams = {};
        if ($searchInput.val()) {
          if (window._searchFields && window._searchFields.length > 0) {
            searchParams.search = {};
            for (var i = 0; i < window._searchFields.length; i++) {
              searchParams.search[window._searchFields[i]] = $searchInput.val();
            }
          }
          else {
            searchParams.search = {title: $searchInput.val()};
          }
        }
        $.get(location.href, searchParams, function(data) {
          $('#content').html(data);
        });
      }, 500);
    });
    $searchInputWrapper.append($searchInput);
    $('#page_selection').append($searchInputWrapper);
  }


  jQuery.fn.extend({
    duplicateAfter: function(resetInputs) {
      var $obj = this.clone();
      if (resetInputs) {
        $obj.resetFormElement();
      }
      this.after($obj);
    },
    resetFormElement: function() {
      this.find('input').val('');
      if (this.data('image-preview')) {
        this.find(this.data('image-preview')).empty();
      }
    },
    removeFormElement: function() {
      var $formGroup = $(this).parents('.form-group'),
        $form = $formGroup.parents('form');

    }
  });

  var initSummernote = function() {
    $('.summernote').not('.loaded').summernote({
      disableDragAndDrop: true,
      height: 200,
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        // ['fontname', ['fontname']],
        // ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        // ['height', ['height']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['fullscreen', 'codeview']],
        ['help', ['help']]
      ]
    }).addClass('loaded');
  };

  $(document).ready(function(){
    initSummernote();

    // object references selection for objects
    var $objecttypeTrigger;
    $('#objectFormModal').on('click', '.select-objecttype', function() {
      $objecttypeTrigger = $(this);
    });
    $('body').on('shown.bs.modal', '#objectTypesModal', function () {
      var $modal = $(this);
      $modal.on('click', '.select-object', function(){
        $objecttypeTrigger.siblings('input').val($(this).data('object-id'));
        $objecttypeTrigger
          .removeClass('btn-default')
          .addClass('btn-success')
          .html($(this).parents('tr').children().first().html() +
            ' ausgewählt');
        $modal.modal('hide');
      });
    });

    // disable modal caching
    $('#objectFormModal, #objectTypesModal').on('hidden.bs.modal', function() {
      $(this).removeData('bs.modal');
    });
  });


  var referencesResolve = function() {
    $('[data-object-references]').not('.loaded').each(function(){
      var $this = $(this);
      $this.addClass('loaded');
      $.get(
        '/admin/objects/references',
        {type: $this.data('object-type'), ids: $this.data('object-references')},
        function( data ) {
          $this.html(data);
        }
      );
    });
  };

  $(document).popover({
    html: true,
    selector: 'img[data-content]',
    trigger: 'hover',
  });

  $(document).ajaxSuccess(function() {
    referencesResolve();
    initSummernote();
  });

  referencesResolve();
});


// set last-updated
$.get( '/index/lastupdate', function( data ) {
  $('#last-update').append(data.lastupdate);
}, 'json');

