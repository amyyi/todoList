export default (type = 'success', msg = '', autoDismiss = 5, position = 'tr') => {

  const iconClassHash = {
    'success': 'icon-success',
    'failure': 'icon-failure',
    'loading': 'icon-loading'
  };
  const iconClass = iconClassHash[type] ? iconClassHash[type] : iconClassHash.success;

  return {
    message: `
      <i class="notification-icon ${iconClass}"></i>
      <div class="notification-text-wrap" title="${msg}">
        <div class="notification-text">
          ${msg}
        </div>
      </div>
    `,
    iconClass: iconClass,
    level: 'success',
    autoDismiss: autoDismiss,
    dismissible: false,
    position: position
  };
};
