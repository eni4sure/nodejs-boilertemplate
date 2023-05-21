function response(message: string, data: any, success?: boolean): any {
    return {
        message: message,
        data: data || null,
        success: success == null ? true : success,
    };
}

export default response;
