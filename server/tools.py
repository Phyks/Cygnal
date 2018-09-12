import arrow


def UTC_now():
    return arrow.utcnow().replace(microsecond=0).naive
