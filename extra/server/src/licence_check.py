from pytransform import get_license_info, get_expired_days
try:
    print(get_license_info())
    code = get_license_info()['CODE']
    left_days = get_expired_days()
    if left_days == -1:
        print('This license for %s is never expired' % code)
    else:
        print('This license for %s will be expired in %d days' % (code, left_days))
except Exception as e:
    print(e)