exports.TokenSender = async (user, res) => {
    try {
        const token = await user.generateJWT();
        return res.status(200).json({
            success: true,
            message: 'Login successfull',
            token: token
        })
    } catch (error) {
        console.log(error);
        res.send({
            success: false,
            err: error
        })
    }
}