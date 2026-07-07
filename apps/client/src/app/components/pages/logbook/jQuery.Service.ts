import * as $ from 'jquery';

const HideAll = () => {
  $('#archive').hide();
  $('#archiveButton').removeClass('active');
  $('#dashboard').hide();
  $('#dashboardButton').removeClass('active');
  $('#details').hide();
  $('#detailsButton').removeClass('active');
};

const init = () => {

  $('#detailsButton').on('click', () => {
    HideAll();
    $('#detailsButton').addClass('active');
    $('#details').fadeIn();
  });

  $('#dashboardButton').on('click', () => {
    HideAll();
    $('#dashboardButton').addClass('active');
    $('#dashboard').fadeIn();
  });

  $('#archiveButton').on('click', () => {
    HideAll();
    $('#archiveButton').addClass('active');
    $('#archive').fadeIn();
  });

};

export default init;
